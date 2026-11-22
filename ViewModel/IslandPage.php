<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\ViewModel;

use Hryvinskyi\AdminUi\Api\Exception\InvalidIslandException;
use Hryvinskyi\AdminUi\Api\Page\IslandInterface;
use Hryvinskyi\AdminUi\Api\Page\IslandPageInterface;
use Hryvinskyi\AdminUi\Api\Page\KitPhrasesInterface;
use Hryvinskyi\AdminUi\Api\Page\ModuleScriptInterface;
use Magento\Framework\Locale\ResolverInterface;
use Magento\Framework\Serialize\SerializerInterface;
use Magento\Framework\View\Asset\Repository;
use Magento\Framework\View\Element\Block\ArgumentInterface;

/**
 * The page that hosts one island, and what its template prints
 *
 * One shared instance serves a request: the page's controller opens it with the island, and the island handle's
 * layout hands the same instance to the template. Opening reads every part of the island once and checks it, so a
 * fault fails the request before anything is rendered; the page keeps only what it prints. The document is written
 * with `<` and `>` escaped, so no value can end the script element it is printed in.
 *
 * @phpstan-import-type JsonObject from IslandInterface
 */
class IslandPage implements IslandPageInterface, ArgumentInterface
{
    /**
     * What the page prints, once it is opened
     *
     * @var array{
     *     name: string,
     *     rootClass: string,
     *     stylesheets: list<string>,
     *     config: string,
     *     scripts: string,
     *     loading: string,
     *     failed: string
     * }|null
     */
    private ?array $opened = null;

    /**
     * @param ModuleScriptInterface $moduleScript
     * @param KitPhrasesInterface $kitPhrases
     * @param ResolverInterface $localeResolver The admin user's interface locale in the admin area
     * @param Repository $assetRepository Resolves a stylesheet's file id for the request's area, theme and locale
     * @param SerializerInterface $json Writes JSON with `<` and `>` escaped
     */
    public function __construct(
        private readonly ModuleScriptInterface $moduleScript,
        private readonly KitPhrasesInterface $kitPhrases,
        private readonly ResolverInterface $localeResolver,
        private readonly Repository $assetRepository,
        private readonly SerializerInterface $json
    ) {
    }

    /**
     * @inheritDoc
     */
    public function open(IslandInterface $island): void
    {
        if ($this->opened !== null) {
            throw new \LogicException(sprintf(
                'The admin page already holds the island "%s"; a page holds one island.',
                $this->opened['name']
            ));
        }
        $name = $island->getName();
        if (preg_match(IslandInterface::NAME_PATTERN, $name) !== 1) {
            throw new InvalidIslandException(
                InvalidIslandException::REASON_NAME,
                sprintf(
                    'The island name "%s" must be a lower-case letter followed by up to 63 lower-case letters, '
                    . 'digits and dashes.',
                    $name
                )
            );
        }
        $rootClass = $island->getRootClass();
        if (preg_match(IslandInterface::ROOT_CLASS_PATTERN, $rootClass) !== 1) {
            throw new InvalidIslandException(
                InvalidIslandException::REASON_ROOT_CLASS,
                sprintf(
                    'The root class "%s" of the island "%s" must be lower-case class names separated by single '
                    . 'spaces.',
                    $rootClass,
                    $name
                )
            );
        }
        $entry = $island->getEntry();
        $imports = $this->imports($name, $island->getImports());
        $stylesheets = $this->stylesheets($name, $island->getStyles());
        $config = $this->document($name, $island->getConfig());
        $scripts = $this->moduleScript->render($entry, $imports);

        $this->opened = [
            'name' => $name,
            'rootClass' => $rootClass === '' ? 'hui' : 'hui ' . $rootClass,
            'stylesheets' => $stylesheets,
            'config' => $config,
            'scripts' => $scripts,
            'loading' => $island->getLoadingText(),
            'failed' => $island->getFailedText(),
        ];
    }

    /**
     * Get the island's name: the root's `data-role` and the prefix of the loading line's and the document's
     *
     * @return string
     * @throws \LogicException When the page was not opened
     */
    public function getName(): string
    {
        return $this->opened()['name'];
    }

    /**
     * Get the root element's classes: the kit's `hui`, then the island's own
     *
     * @return string
     * @throws \LogicException When the page was not opened
     */
    public function getRootClass(): string
    {
        return $this->opened()['rootClass'];
    }

    /**
     * Get the addresses of the island's stylesheets, in the order they are linked, after the kit's in the head
     *
     * @return list<string>
     * @throws \LogicException When the page was not opened
     */
    public function getStylesheets(): array
    {
        return $this->opened()['stylesheets'];
    }

    /**
     * Get the island's document as JSON safe to print inside a script element
     *
     * @return string
     * @throws \LogicException When the page was not opened
     */
    public function getConfigJson(): string
    {
        return $this->opened()['config'];
    }

    /**
     * Get the tags that load the island: the import map of the kit's and the island's modules, then the entry module
     *
     * @return string
     * @throws \LogicException When the page was not opened
     */
    public function getScripts(): string
    {
        return $this->opened()['scripts'];
    }

    /**
     * Get the line shown while the island loads, and to a browser that runs no script
     *
     * @return string Translated
     * @throws \LogicException When the page was not opened
     */
    public function getLoadingText(): string
    {
        return $this->opened()['loading'];
    }

    /**
     * Get the line the island shows when it cannot start
     *
     * @return string Translated
     * @throws \LogicException When the page was not opened
     */
    public function getFailedText(): string
    {
        return $this->opened()['failed'];
    }

    /**
     * The import map's file ids: the kit's, then the island's own, none of which may name a kit specifier
     *
     * @param string $name The island's name, for the message
     * @param array<string,string> $own The island's own file ids, keyed by specifier
     * @return array<string, string>
     * @throws InvalidIslandException When the island imports a kit specifier
     */
    private function imports(string $name, array $own): array
    {
        $imports = self::KIT_IMPORTS;
        foreach ($own as $specifier => $fileId) {
            $specifier = (string) $specifier;
            if (array_key_exists($specifier, self::KIT_IMPORTS)) {
                throw new InvalidIslandException(
                    InvalidIslandException::REASON_IMPORT,
                    sprintf(
                        'The island "%s" imports "%s", a specifier the kit resolves itself; '
                        . 'an island imports the kit\'s modules through the kit\'s own entries.',
                        $name,
                        $specifier
                    )
                );
            }
            $imports[$specifier] = $fileId;
        }

        return $imports;
    }

    /**
     * Resolve the island's stylesheets to their addresses
     *
     * @param string $name The island's name, for the message
     * @param list<string> $styles The stylesheets' file ids
     * @return list<string>
     * @throws InvalidIslandException When a stylesheet is not a module's `.css` file id
     * @throws \Magento\Framework\Exception\LocalizedException When a stylesheet's file cannot be resolved
     */
    private function stylesheets(string $name, array $styles): array
    {
        $addresses = [];
        foreach ($styles as $fileId) {
            if (preg_match(IslandInterface::STYLE_FILE_ID_PATTERN, $fileId) !== 1) {
                throw new InvalidIslandException(
                    InvalidIslandException::REASON_STYLE,
                    sprintf(
                        'The stylesheet "%s" of the island "%s" must be the file id of a stylesheet '
                        . '(Vendor_Module::path/file.css).',
                        $fileId,
                        $name
                    )
                );
            }
            $addresses[] = $this->assetRepository->getUrl($fileId);
        }

        return $addresses;
    }

    /**
     * Write the island's document: the kit's locale and phrases, and the island's configuration as the page's part
     *
     * @param string $name The island's name, for the message
     * @param JsonObject $config The island's configuration
     * @return string
     * @throws InvalidIslandException When the configuration holds something other than JSON data, or cannot be
     *     written as JSON
     */
    private function document(string $name, array $config): string
    {
        $this->assertJsonData($name, $config, 'page');
        $phrases = $this->kitPhrases->getPhrases();
        $document = [
            'kit' => [
                'locale' => $this->localeResolver->getLocale(),
                'phrases' => $phrases === [] ? (object) [] : $phrases,
            ],
            'page' => $config === [] ? (object) [] : $config,
        ];
        try {
            $json = $this->json->serialize($document);
        } catch (\InvalidArgumentException $fault) {
            $this->failConfig($name, 'cannot be written as JSON: ' . $fault->getMessage(), $fault);
        }
        if (!is_string($json)) {
            $this->failConfig($name, 'cannot be written as JSON');
        }

        return $json;
    }

    /**
     * Refuse any value that is not JSON data: an object other than a \stdClass, or anything else no JSON type holds
     *
     * @param string $name The island's name, for the message
     * @param array<array-key,mixed>|\stdClass $value The array or object to walk; its members come from the island
     *     and are checked here, whatever their declared type
     * @param string $path Where the value sits in the document, for the message
     * @return void
     * @throws InvalidIslandException
     */
    private function assertJsonData(string $name, array|\stdClass $value, string $path): void
    {
        foreach (is_array($value) ? $value : get_object_vars($value) as $key => $member) {
            $at = $path . '.' . $key;
            if (is_array($member) || $member instanceof \stdClass) {
                $this->assertJsonData($name, $member, $at);
                continue;
            }
            if ($member !== null && !is_scalar($member)) {
                $this->failConfig($name, sprintf(
                    'holds %s at %s; only JSON data (scalars, arrays and \stdClass objects) is printed',
                    get_debug_type($member),
                    $at
                ));
            }
        }
    }

    /**
     * Refuse a configuration that cannot be printed
     *
     * @param string $name The island's name
     * @param string $problem What is wrong with it, completing "The configuration of the island … "
     * @param \Throwable|null $previous
     * @return never
     * @throws InvalidIslandException Always
     */
    private function failConfig(string $name, string $problem, ?\Throwable $previous = null): never
    {
        throw new InvalidIslandException(
            InvalidIslandException::REASON_CONFIG,
            sprintf('The configuration of the island "%s" %s.', $name, $problem),
            $previous
        );
    }

    /**
     * Get what the page prints
     *
     * @return array{
     *     name: string,
     *     rootClass: string,
     *     stylesheets: list<string>,
     *     config: string,
     *     scripts: string,
     *     loading: string,
     *     failed: string
     * }
     * @throws \LogicException When the page was not opened
     */
    private function opened(): array
    {
        return $this->opened ?? throw new \LogicException(
            'The island page is printed before its controller opened it with an island.'
        );
    }
}
