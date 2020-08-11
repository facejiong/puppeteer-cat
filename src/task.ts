import { launch, Page } from 'puppeteer';
import { mkdir, readFileSync } from 'fs';
import path from 'path';
import { parse } from 'node-xlsx';
import config from '../../../config';
import { download, clickSafely } from './download';
import { wait } from '../../utils/index';
import { upload } from './upload';
import { alertEmail } from '../../utils/request';
import { globalLogger } from '../../utils/logger';
import { checkScheduleStatus } from '../../utils/request';

const titles = [
  'วันที่ทำรายการ',
  'เวลาทำรายการ',
  'รายการ',
  'เลขที่เช็ค',
  'ถอนเงิน',
  'ฝากเงิน',
  'ยอดเงินคงเหลือ',
  'รหัสสาขา',
  'ผู้ทำรายการ',
  'วันที่รายการมีผล',
  'สกุลเงิน',
];
async function login(page: Page) {
  try {
    await page.goto(config.kbank.home, {});
    // 进入首页
    await page.type('#user', config.kbank.user, {
      delay: 100,
    });
    await page.type('#txtpassword', config.kbank.password, {
      delay: 100,
    });

    await page.keyboard.press('Enter');
  } catch (err) {
    globalLogger.error('[puppteer kbank] login bank failed');
    throw err;
  }
}
// 检查是否有泰文
const checkLanguage = (filename: string) => {
  let vaild = true;
  const filePath = path.resolve(config['kbank'].downloadDir, filename);
  const workSheetsFromBuffer = parse(readFileSync(filePath));
  const reportTitles =
    workSheetsFromBuffer &&
    workSheetsFromBuffer[0] &&
    workSheetsFromBuffer[0].data &&
    workSheetsFromBuffer[0].data[0];
  reportTitles &&
    reportTitles.forEach(title => {
      if (titles.indexOf(title) >= 0) {
        vaild = false;
      }
    });
  globalLogger.info(`[puppteer kbank] check language if Thai: ${!vaild}`);
  return vaild;
};

const makeClient = async (page: Page) => {
  try {
    page.setViewport({
      width: 1366,
      height: 768,
    });
    mkdir(config.kbank.downloadDir, { recursive: true }, () => {});
    const client = await page.target().createCDPSession();
    client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: config.kbank.downloadDir,
    });
  } catch (err) {
    globalLogger.error(
      `[puppteer kbank] make client error. error=${
        typeof err === 'object' ? JSON.stringify(err) : err
      }`
    );
  }
};
const downloading = async (page: Page, type: 'realtime' | 'history') => {
  try {
    // 开始下载
    await clickSafely(page, '#wrapper_downloadType');

    // 下载中
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.selectric-scroll li');
      elements.forEach(e => {
        if (e.innerHTML === 'XLS') {
          (e as HTMLElement).click();
        }
      });
    });

    // 下载报表
    const files = await download(page, type);
    const vaild = checkLanguage(files[0]);
    if (!vaild) {
      return;
    }
    await upload('kbank', files, type);
  } catch (err) {
    globalLogger.error(
      `[puppteer kbank] download error. error=${
        typeof err === 'object' ? JSON.stringify(err) : err
      }`
    );
  }
};
const openView = async (page: Page) => {
  try {
    // 进入列表页
    await clickSafely(page, '#mbar_MB75');

    // 切换成英语
    await clickSafely(page, '#main_language');
    await wait(1000); // 点击语言切换时下拉菜单有动画效果
    await clickSafely(page, '#lang_one');
    await wait(1000); // 语言切换存在一定加载时间
    // 进入下载页
    await page.waitForSelector('span.link_content_hover');
    await page
      .evaluate((c: typeof config) => {
        const elements = document.querySelectorAll('td .link_content_hover');
        elements.forEach(element => {
          if ((element as HTMLElement).innerText === c.kbank.account) {
            (element as HTMLElement).click();
          }
        });
      }, config as any)
      .catch(err => {
        globalLogger.error(
          `[puppteer kbank] select account error. error=${
            typeof err === 'object' ? JSON.stringify(err) : err
          }`
        );
      });
  } catch (err) {
    globalLogger.error(
      `[puppteer kbank] open view error. error=${
        typeof err === 'object' ? JSON.stringify(err) : err
      }`
    );
  }
};

export default async function task(type: 'realtime' | 'history') {
  const status = await checkScheduleStatus(6, 7);
  if (!status) {
    return;
  }
  const browser = await launch({
    timeout: 60 * 1000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    userDataDir: './user_data',
  });
  const page = await browser.newPage();
  globalLogger.info(
    `[puppteer kbank] launch success. time=${Date.now()}|type=${type}`
  );
  try {
    await makeClient(page);
    await login(page);

    await openView(page);

    await downloading(page, type);
    // 退出
    await clickSafely(page, '.btn_logout');
    await wait(1000); // 需要等待动画效果结束
    await clickSafely(page, '#btn-ok');
  } catch (err) {
    globalLogger.error(
      `[puppteer kbank] execute error. error=${
        typeof err === 'object' ? JSON.stringify(err) : err
      }`
    );
    alertEmail('kbank', 'loginFail');
  } finally {
    browser.close();
  }
}
