import axios from "axios";
import { JSDOM } from "jsdom";

const SIP_BASE_URL = "http://sip.xho.biz"; // панель по HTTP, как в HAR

/**
 * Клиент для работы с web-панелью sip.xho.biz через HTTP.
 * Логика:
 * - авторизация в панели стандартным способом (cookie-сессия) пока не реализована;
 * - для большинства задач лучше использовать webhook (см. /api/sip/webhook);
 * - тут оставлены вспомогательные методы, которые можно доработать под реальный API панели.
 */
export class SipXhoClient {
  private username: string;
  private password: string;
  private domain: string;

  constructor() {
    this.username = process.env.SIP_USERNAME || "";
    this.password = process.env.SIP_PASSWORD || "";
    this.domain = process.env.SIP_DOMAIN || "sip.xho.biz";
  }

  /**
   * Общий GET-запрос к панели.
   * Сейчас без авторизации по cookie — предполагается, что панель либо защищена basic auth,
   * либо ты допишешь сюда логику логина и хранения cookie.
   */
  private async getRaw(path: string, params?: any): Promise<string> {
    const url = `${SIP_BASE_URL}${path}`;
    const res = await axios.get<string>(url, {
      params,
      // Если у провайдера basic auth на вебе — раскомментируй:
      // auth: {
      //   username: this.username,
      //   password: this.password,
      // },
      responseType: "text",
    });
    return res.data;
  }

  /**
   * Пример: получить историю звонков за период.
   * В HAR видно, что история звонков берётся с /call-history.php c параметрами:
   *  - customer
   *  - s, t, current_page, order, sens, terminatecauseid
   * Здесь мы делаем базовый запрос, который ты можешь допилить под свои нужды.
   */
  async getCalls(from: Date, to: Date): Promise<any[]> {
    const html = await this.getRaw("/call-history.php", {
      // Заглушечные параметры. Подгони под реальные значения из своей учётки.
      customer: 21728,
      s: 1,
      t: 0,
      current_page: 1,
      order: "calldate",
      sens: "DESC",
      // terminatecauseid: "ANSWER", // если нужно только отвеченные
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const rows = Array.from(document.querySelectorAll("table tr"));
    const result: any[] = [];

    rows.slice(1).forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 5) return;
      const date = tds[0].textContent?.trim();
      const src = tds[1].textContent?.trim();
      const dst = tds[2].textContent?.trim();
      const duration = tds[3].textContent?.trim();
      const status = tds[4].textContent?.trim();
      if (!dst) return;
      result.push({ date, src, dst, duration, status });
    });

    return result;
  }

  /**
   * Пример: получить баланс счёта из userinfo.php.
   * Без реального HTML это сделано как best-effort через RegExp.
   * Когда увидишь реальную разметку, просто подправь regex.
   */
  async getBalance(): Promise<number | null> {
    try {
      const html = await this.getRaw("/userinfo.php");
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const bodyText = document.body.textContent || "";

      // Ищем что-то вроде "Balance: 123.45" или "Баланс: 123.45"
      const match =
        bodyText.match(/Balance\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i) ||
        bodyText.match(/Баланс\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);

      if (match) {
        return parseFloat(match[1]);
      }
      return null;
    } catch (e) {
      console.error("Failed to fetch SIP balance", e);
      return null;
    }
  }
}
