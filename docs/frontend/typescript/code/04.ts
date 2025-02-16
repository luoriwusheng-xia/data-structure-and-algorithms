
interface Config {
    apiKey: string;
    timeout: number;
}

type ReadonlyConfig = Readonly<Config>;
const config: ReadonlyConfig = { apiKey: '123', timeout: 5000 };
// 下面的代码会报错，因为属性是只读的
// config.apiKey = 'newKey';