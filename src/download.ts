import { Page } from 'puppeteer';
import { readdir } from 'fs';
import path from 'path';
import moment from 'moment';
import { wait } from '../../utils/index';
import { promisify } from 'util';
import config from '../../../config';
import { months } from '../../constants';
import { globalLogger } from '../../utils/logger';

export const clickSafely = async (page: Page, selector: string) => {
  await page.waitForSelector(selector, { timeout: 10 * 60 * 1000 });
  await page.click(selector);
};
export const checkExtname = (file: string) => {
  return path.extname(file) === '.xls';
};
export async function checkDownload() {
  // check 下载文件
  let isFinish = false;
  let files: string[] = [];
  while (!isFinish) {
    await wait(1000);
    files = await promisify(readdir)(config.kbank.downloadDir);
    if (files.length > 0 && checkExtname(files[0])) {
      isFinish = true;
    }
  }
  return files;
}
export async function download(page: Page, type: 'history' | 'realtime') {
  const commonDownload = async () => {
    await clickSafely(page, '.update_text > .link_content_hover');
    // check 下载文件
    const files = await checkDownload();
    return files;
  };
  // 下载历史报表
  if (type === 'history') {
    try {
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('.custom-checkbox');
        const button = buttons[1];
        (button as HTMLElement).click();
      });
      await page.evaluate(() => {
        const toDateEl = document.querySelector('#toDate');
        const fromDateEl = document.querySelector('#fromDate');
        const endDate = (toDateEl as any).value;
        let startDate = moment(moment(endDate).format('YYYY-MM-DD'))
          .subtract(1, 'day')
          .format('DD-MM-YYYY');
        for (let [key, value] of Object.entries(months)) {
          startDate = startDate.replace(key, value);
        }
        (fromDateEl as any).value = startDate;
      });
    } catch (err) {
      globalLogger.error(`[puppteer kbank] download err`, err);
    }
  }
  return commonDownload();
}
