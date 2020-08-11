export default {
  dir: '/data/server', // 下载文件地址
  kbank: {
    home: '',
    headless: true,
    downloadDir: '/data/server/kbank/', // 详细下载文件地址
    user: '',
    password: '',
    account: '',
    email: {
      smtp: {
        host: '',
        port: 587,
        secure: false,
      },
      from: '',
      receivers: '',
      loginFail: {
        title:
          '[Test][AIRPAY IS][BT] KBank Manual Transfer Login Bank Portal Warning. ',
        content:
          'Login KBank portal failed, please inform developers to check.',
      },
    },
  },
  scb: {
    home: '',
    headless: true,
    downloadDir: '/data/server/scb/', // 详细下载文件地址
    user: '',
    password: '',
    account: '',
    corportateId: '',
    email: {
      smtp: {
        host: '',
        port: 587,
        secure: false,
      },
      from: '',
      receivers: '',
      // timeout: {
      //     title: '[AIRPAY IS] [BT] KBank Manual Transfer Download From S3 Error',
      //     content: 'Cannot download new KBank reports within 30min. Please inform developers to check'
      // },
      exception: {
        title: '[Test][Alert][ATM Bill Payment] SCB script download alert',
        content: (time: string) =>
          `IS can not download bank statement since (${time})`,
      },
    },
  },
  ktb: {
    home: '',
    headless: true,
    downloadDir: '/data/server/kbank/', // 详细下载文件地址
    user: '',
    password: '',
    account: '',
    email: {
      smtp: {
        host: '',
        port: 587,
        secure: false,
      },
      from: '',
      receivers: '',
      loginFail: {
        title:
          ' [AIRPAY IS] [BT] KTB Manual Transfer Login Bank Portal Warning. ',
        content: 'Login KTB portal failed, please inform developers to check.',
      },
      // timeout: {
      //     title: '[AIRPAY IS] [BT] KBank Manual Transfer Download From S3 Error',
      //     content: 'Cannot download new KBank reports within 30min. Please inform developers to check'
      // },
      exception: {
        title:
          '[AIRPAY IS] [BT] KTB Manual Transfer open download page timeout',
        content:
          'Download Page loads more than 6 minutes. Please inform developers to check',
      },
    },
  },
  s3: {
    apiVersion: '2006-03-01',
    endpoint: '',
    credentials: {
      accessKeyId: '',
      secretAccessKey: '',
    },
    s3BucketName: '',
    s3ProxyAddr: 'https://file-server.test.airpay.in.th',
    s3ProxyAuthKey: '',
  },
};
