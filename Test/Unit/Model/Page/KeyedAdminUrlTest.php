<?php
/**
 * Copyright (c) 2026. Volodymyr Hryvinskyi. All rights reserved.
 * Author: Volodymyr Hryvinskyi <volodymyr@hryvinskyi.com>
 * GitHub: https://github.com/hryvinskyi
 */

declare(strict_types=1);

namespace Hryvinskyi\AdminUi\Test\Unit\Model\Page;

use Hryvinskyi\AdminUi\Model\Page\KeyedAdminUrl;
use Magento\Backend\Model\UrlInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * A keyed address carries its key whatever the shared URL builder was left with, and the builder's key switch is left
 * as it was found, even when building the address fails
 */
class KeyedAdminUrlTest extends TestCase
{
    /**
     * Whether the stand-in builder adds keys now, as the backend builder's switch holds it between calls
     *
     * @var bool
     */
    private bool $switchOn = true;

    /**
     * Whether the admin uses secret keys at all
     *
     * @var bool
     */
    private bool $keysConfigured = true;

    /**
     * @var list<string>
     */
    private array $built = [];

    public function testAnAddressBuiltWhileTheKeyIsOffCarriesItAndTheSwitchIsOffAgainAfterwards(): void
    {
        $this->switchOn = false;

        $url = (new KeyedAdminUrl($this->builder()))->getUrl('vendor_module/reports/index');

        self::assertSame('https://admin.test/admin/vendor_module/reports/index/key/0a1b2c/', $url);
        self::assertFalse($this->switchOn);
    }

    public function testAnAddressBuiltWhileTheKeyIsOnLeavesItOnAndPassesTheParameters(): void
    {
        $url = (new KeyedAdminUrl($this->builder()))->getUrl('adminhtml/system_config/edit', ['section' => 'web']);

        self::assertSame('https://admin.test/admin/adminhtml/system_config/edit/section/web/key/0a1b2c/', $url);
        self::assertTrue($this->switchOn);
        self::assertSame(['adminhtml/system_config/edit'], $this->built);
    }

    public function testTwoAddressesInARowAreBothKeyedWhateverTheFirstFoundTheSwitchAt(): void
    {
        $this->switchOn = false;
        $keyed = new KeyedAdminUrl($this->builder());

        $first = $keyed->getUrl('vendor_module/reports/index');
        $second = $keyed->getUrl('vendor_module/reports/data');

        self::assertStringEndsWith('/reports/index/key/0a1b2c/', $first);
        self::assertStringEndsWith('/reports/data/key/0a1b2c/', $second);
        self::assertFalse($this->switchOn);
    }

    public function testWhereTheAdminUsesNoKeysTheAddressHasNoneAndTheSwitchIsAsItWas(): void
    {
        $this->keysConfigured = false;
        $this->switchOn = false;

        $url = (new KeyedAdminUrl($this->builder()))->getUrl('vendor_module/reports/index');

        self::assertSame('https://admin.test/admin/vendor_module/reports/index/', $url);
        self::assertFalse($this->switchOn);
    }

    public function testTheSwitchIsLeftAsItWasFoundWhenBuildingTheAddressFails(): void
    {
        $this->switchOn = false;
        try {
            (new KeyedAdminUrl($this->builder(true)))->getUrl('vendor_module/reports/index');
            self::fail('The failure reaches the caller.');
        } catch (\RuntimeException) {
            self::assertFalse($this->switchOn);
        }
    }

    /**
     * A stand-in for the backend URL builder: one key switch kept between calls, as the real one keeps it
     *
     * @param bool $failing whether building an address throws
     * @return UrlInterface&MockObject
     */
    private function builder(bool $failing = false): UrlInterface
    {
        $builder = $this->createMock(UrlInterface::class);
        $builder->method('useSecretKey')->willReturnCallback(fn (): bool => $this->keysConfigured && $this->switchOn);
        $builder->method('turnOnSecretKey')->willReturnCallback(function () use ($builder): UrlInterface {
            $this->switchOn = true;

            return $builder;
        });
        $builder->method('turnOffSecretKey')->willReturnCallback(function () use ($builder): UrlInterface {
            $this->switchOn = false;

            return $builder;
        });
        $builder->method('getUrl')->willReturnCallback(
            function (?string $route = null, mixed $params = null) use ($failing): string {
                if ($failing) {
                    throw new \RuntimeException('No route.');
                }
                $this->built[] = (string) $route;
                $path = (string) $route;
                foreach (is_array($params) ? $params : [] as $name => $value) {
                    $path .= '/' . $name . '/' . (is_scalar($value) ? (string) $value : '');
                }
                $keyed = $this->keysConfigured && $this->switchOn;

                return 'https://admin.test/admin/' . $path . '/' . ($keyed ? 'key/0a1b2c/' : '');
            }
        );

        return $builder;
    }
}
