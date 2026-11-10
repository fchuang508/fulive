// 脱敏版 Global Extender Script（范例）
// - 内容与 FC 实际使用的全局扩展脚本一致，未含任何 Token / 密码 / 订阅链接
// - 用途：供应商节点保持原样，分组与规则由脚本统一生成
// - 部署方式：Clash Verge 设置 → 全局扩展脚本，整份贴上

// FC global policy: supplier nodes stay intact; groups and rules are generated together.
// Deploy this whole file as Global Extend Script. Profile scripts contain exceptions only.

const INFORMATION_PATTERN = /剩余|剩餘|流量|套餐|到期|重置|官网|官網|刷新订阅|刷新訂閱|使用前|订阅地址|訂閱地址|有效期|配置文件版本|若不能使用/i;
const OPAQUE_NAME_PATTERN = /^[^A-Za-z0-9\u3400-\u9fff]*(?:[A-Za-z]{5,10}[._ -]?\d{2}|[A-Za-z]{2}[._ -][A-Za-z]{3,}[._ -]\d{2})[^A-Za-z0-9\u3400-\u9fff]*$/u;
const STRUCTURED_COUNTRY_CODE_PATTERN = /^([A-Z]{2})[._ -][A-Za-z]{3,}[._ -]\d{2}(?=$|[^A-Za-z0-9])/i;
const SAFE_STRUCTURED_COUNTRY_CODES = new Set(['TW', 'HK', 'JP', 'KR', 'SG', 'MY', 'PH', 'US', 'ID', 'BA']);

const COUNTRIES = [
  { code: 'CN', label: '中国', subregion: '东亚', continent: '亚洲', pattern: /中国|中國|大陆|大陸|China|Mainland|🇨🇳/i, },
  { code: 'TW', label: '台湾', subregion: '东亚', continent: '亚洲', pattern: /台灣|台湾|Taiwan|🇹🇼/i, },
  { code: 'HK', label: '香港', subregion: '东亚', continent: '亚洲', pattern: /香港|Hong[ _-]?Kong|🇭🇰/i, },
  { code: 'JP', label: '日本', subregion: '东亚', continent: '亚洲', pattern: /日本|Japan|🇯🇵/i, },
  { code: 'KR', label: '韩国', subregion: '东亚', continent: '亚洲', pattern: /韓國|韩国|Korea|🇰🇷/i, },
  { code: 'SG', label: '新加坡', subregion: '东南亚', continent: '亚洲', pattern: /新加坡|Singapore|🇸🇬/i, },
  { code: 'MY', label: '马来西亚', subregion: '东南亚', continent: '亚洲', pattern: /馬來西亞|马来西亚|Malaysia|🇲🇾/i, },
  { code: 'PH', label: '菲律宾', subregion: '东南亚', continent: '亚洲', pattern: /菲律賓|菲律宾|Philippines|🇵🇭/i, },
  { code: 'US', label: '美国', subregion: '北美', continent: '美洲', pattern: /美國|美国|United[ _-]?States|\bUSA\b|🇺🇸/i, },
  { code: 'ID', label: '印度尼西亚', subregion: '东南亚', continent: '亚洲', pattern: /印度尼西亞|印度尼西亚|Indonesia|🇮🇩/i, },
  { code: 'IN', label: '印度', subregion: '南亚', continent: '亚洲', pattern: /印度(?!尼西[亞亚])|India|🇮🇳/i, },
  { code: 'BA', label: '波黑', subregion: '南欧', continent: '欧洲', pattern: /波斯尼亞|波斯尼亚|波黑|黑塞哥維那|黑塞哥维那|Bosnia|Herzegovina|🇧🇦/i, },
  { code: 'AE', label: '阿联酋', subregion: '西亚', continent: '亚洲', pattern: /阿聯酋|阿联酋|Dubai|杜拜|迪拜|阿布扎比|Abu[ _-]?Dhabi|UAE|🇦🇪/i, },
  { code: 'DK', label: '丹麦', subregion: '北欧', continent: '欧洲', pattern: /丹麥|丹麦|Denmark|🇩🇰/i, },
  { code: 'SE', label: '瑞典', subregion: '北欧', continent: '欧洲', pattern: /瑞典|Sweden|🇸🇪/i, },
  { code: 'IS', label: '冰岛', subregion: '北欧', continent: '欧洲', pattern: /冰島|冰岛|Iceland|🇮🇸/i, },
  { code: 'NO', label: '挪威', subregion: '北欧', continent: '欧洲', pattern: /挪威|Norway|🇳🇴/i, },
  { code: 'DE', label: '德国', subregion: '中欧', continent: '欧洲', pattern: /德國|德国|Germany|🇩🇪/i, },
  { code: 'MO', label: '澳门', subregion: '东亚', continent: '亚洲', pattern: /澳門|澳门|Macau/i },
  { code: 'MN', label: '蒙古', subregion: '东亚', continent: '亚洲', pattern: /蒙古|Mongolia/i },
  { code: 'TH', label: '泰国', subregion: '东南亚', continent: '亚洲', pattern: /泰國|泰国|Thailand/i },
  { code: 'VN', label: '越南', subregion: '东南亚', continent: '亚洲', pattern: /越南|Vietnam/i },
  { code: 'KH', label: '柬埔寨', subregion: '东南亚', continent: '亚洲', pattern: /柬埔寨|Cambodia/i },
  { code: 'MM', label: '缅甸', subregion: '东南亚', continent: '亚洲', pattern: /緬甸|缅甸|Myanmar|Burma/i },
  { code: 'LA', label: '老挝', subregion: '东南亚', continent: '亚洲', pattern: /老撾|老挝|Laos/i },
  { code: 'BN', label: '文莱', subregion: '东南亚', continent: '亚洲', pattern: /文萊|文莱|Brunei/i },
  { code: 'PK', label: '巴基斯坦', subregion: '南亚', continent: '亚洲', pattern: /巴基斯坦|Pakistan/i },
  { code: 'NP', label: '尼泊尔', subregion: '南亚', continent: '亚洲', pattern: /尼泊爾|尼泊尔|Nepal/i },
  { code: 'BD', label: '孟加拉', subregion: '南亚', continent: '亚洲', pattern: /孟加拉|Bangladesh/i },
  { code: 'LK', label: '斯里兰卡', subregion: '南亚', continent: '亚洲', pattern: /斯里蘭卡|斯里兰卡|Sri[ _-]?Lanka/i },
  { code: 'MV', label: '马尔代夫', subregion: '南亚', continent: '亚洲', pattern: /馬爾代夫|马尔代夫|Maldives/i },
  { code: 'KZ', label: '哈萨克', subregion: '中亚', continent: '亚洲', pattern: /哈薩克|哈萨克|Kazakhstan/i },
  { code: 'UZ', label: '乌兹别克', subregion: '中亚', continent: '亚洲', pattern: /烏茲別克|乌兹别克|Uzbekistan/i },
  { code: 'KG', label: '吉尔吉斯', subregion: '中亚', continent: '亚洲', pattern: /吉爾吉斯|吉尔吉斯|Kyrgyzstan/i },
  { code: 'TJ', label: '塔吉克', subregion: '中亚', continent: '亚洲', pattern: /塔吉克|Tajikistan/i },
  { code: 'TM', label: '土库曼', subregion: '中亚', continent: '亚洲', pattern: /土庫曼|土库曼|Turkmenistan/i },
  { code: 'IL', label: '以色列', subregion: '西亚', continent: '亚洲', pattern: /以色列|Israel/i },
  { code: 'IQ', label: '伊拉克', subregion: '西亚', continent: '亚洲', pattern: /伊拉克|Iraq/i },
  { code: 'IR', label: '伊朗', subregion: '西亚', continent: '亚洲', pattern: /伊朗|Iran/i },
  { code: 'TR', label: '土耳其', subregion: '西亚', continent: '亚洲', pattern: /土耳其|Turkey|Türkiye/i },
  { code: 'JO', label: '约旦', subregion: '西亚', continent: '亚洲', pattern: /約旦|约旦|Jordan/i },
  { code: 'LB', label: '黎巴嫩', subregion: '西亚', continent: '亚洲', pattern: /黎巴嫩|Lebanon/i },
  { code: 'KW', label: '科威特', subregion: '西亚', continent: '亚洲', pattern: /科威特|Kuwait/i },
  { code: 'QA', label: '卡塔尔', subregion: '西亚', continent: '亚洲', pattern: /卡塔爾|卡塔尔|Qatar/i },
  { code: 'BH', label: '巴林', subregion: '西亚', continent: '亚洲', pattern: /巴林|Bahrain/i },
  { code: 'OM', label: '阿曼', subregion: '西亚', continent: '亚洲', pattern: /阿曼|Oman/i },
  { code: 'YE', label: '也门', subregion: '西亚', continent: '亚洲', pattern: /也門|也门|Yemen/i },
  { code: 'SY', label: '叙利亚', subregion: '西亚', continent: '亚洲', pattern: /敘利亞|叙利亚|Syria/i },
  { code: 'PS', label: '巴勒斯坦', subregion: '西亚', continent: '亚洲', pattern: /巴勒斯坦|Palestine/i },
  { code: 'SA', label: '沙特', subregion: '西亚', continent: '亚洲', pattern: /沙特|Saudi[ _-]?Arabia/i },
  { code: 'GB', label: '英国', subregion: '西欧', continent: '欧洲', pattern: /英國|英国|United[ _-]?Kingdom|Britain/i },
  { code: 'IE', label: '爱尔兰', subregion: '西欧', continent: '欧洲', pattern: /愛爾蘭|爱尔兰|Ireland/i },
  { code: 'FR', label: '法国', subregion: '西欧', continent: '欧洲', pattern: /法國|法国|France/i },
  { code: 'NL', label: '荷兰', subregion: '西欧', continent: '欧洲', pattern: /荷蘭|荷兰|Netherlands|Holland/i },
  { code: 'BE', label: '比利时', subregion: '西欧', continent: '欧洲', pattern: /比利時|比利时|Belgium/i },
  { code: 'LU', label: '卢森堡', subregion: '西欧', continent: '欧洲', pattern: /盧森堡|卢森堡|Luxembourg/i },
  { code: 'AT', label: '奥地利', subregion: '西欧', continent: '欧洲', pattern: /奧地利|奥地利|Austria/i },
  { code: 'CH', label: '瑞士', subregion: '西欧', continent: '欧洲', pattern: /瑞士|Switzerland/i },
  { code: 'LI', label: '列支敦士登', subregion: '西欧', continent: '欧洲', pattern: /列支敦士登|Liechtenstein/i },
  { code: 'MC', label: '摩纳哥', subregion: '西欧', continent: '欧洲', pattern: /摩納哥|摩纳哥|Monaco/i },
  { code: 'FI', label: '芬兰', subregion: '北欧', continent: '欧洲', pattern: /芬蘭|芬兰|Finland/i },
  { code: 'IT', label: '意大利', subregion: '南欧', continent: '欧洲', pattern: /義大利|意大利|Italy/i },
  { code: 'ES', label: '西班牙', subregion: '南欧', continent: '欧洲', pattern: /西班牙|Spain/i },
  { code: 'PT', label: '葡萄牙', subregion: '南欧', continent: '欧洲', pattern: /葡萄牙|Portugal/i },
  { code: 'GR', label: '希腊', subregion: '南欧', continent: '欧洲', pattern: /希臘|希腊|Greece/i },
  { code: 'MT', label: '马耳他', subregion: '南欧', continent: '欧洲', pattern: /馬耳他|马耳他|Malta/i },
  { code: 'HR', label: '克罗地亚', subregion: '南欧', continent: '欧洲', pattern: /克羅地亞|克罗地亚|Croatia/i },
  { code: 'SI', label: '斯洛文尼亚', subregion: '南欧', continent: '欧洲', pattern: /斯洛文尼亞|斯洛文尼亚|Slovenia/i },
  { code: 'RS', label: '塞尔维亚', subregion: '南欧', continent: '欧洲', pattern: /塞爾維亞|塞尔维亚|Serbia/i },
  { code: 'MK', label: '北马其顿', subregion: '南欧', continent: '欧洲', pattern: /北馬其頓|北马其顿|Macedonia/i },
  { code: 'ME', label: '黑山', subregion: '南欧', continent: '欧洲', pattern: /黑山|Montenegro/i },
  { code: 'AL', label: '阿尔巴尼亚', subregion: '南欧', continent: '欧洲', pattern: /阿爾巴尼亞|阿尔巴尼亚|Albania/i },
  { code: 'BG', label: '保加利亚', subregion: '南欧', continent: '欧洲', pattern: /保加利亞|保加利亚|Bulgaria/i },
  { code: 'RO', label: '罗马尼亚', subregion: '南欧', continent: '欧洲', pattern: /羅馬尼亞|罗马尼亚|Romania/i },
  { code: 'CY', label: '塞浦路斯', subregion: '南欧', continent: '欧洲', pattern: /塞浦路斯|Cyprus/i },
  { code: 'PL', label: '波兰', subregion: '中欧', continent: '欧洲', pattern: /波蘭|波兰|Poland/i },
  { code: 'CZ', label: '捷克', subregion: '中欧', continent: '欧洲', pattern: /捷克|Czech/i },
  { code: 'SK', label: '斯洛伐克', subregion: '中欧', continent: '欧洲', pattern: /斯洛伐克|Slovakia/i },
  { code: 'HU', label: '匈牙利', subregion: '中欧', continent: '欧洲', pattern: /匈牙利|Hungary/i },
  { code: 'UA', label: '乌克兰', subregion: '东欧', continent: '欧洲', pattern: /烏克蘭|乌克兰|Ukraine/i },
  { code: 'BY', label: '白俄罗斯', subregion: '东欧', continent: '欧洲', pattern: /白俄羅斯|白俄罗斯|Belarus/i },
  { code: 'LT', label: '立陶宛', subregion: '东欧', continent: '欧洲', pattern: /立陶宛|Lithuania/i },
  { code: 'LV', label: '拉脱维亚', subregion: '东欧', continent: '欧洲', pattern: /拉脫維亞|拉脱维亚|Latvia/i },
  { code: 'EE', label: '爱沙尼亚', subregion: '东欧', continent: '欧洲', pattern: /愛沙尼亞|爱沙尼亚|Estonia/i },
  { code: 'MD', label: '摩尔多瓦', subregion: '东欧', continent: '欧洲', pattern: /摩爾多瓦|摩尔多瓦|Moldova/i },
  { code: 'CA', label: '加拿大', subregion: '北美', continent: '美洲', pattern: /加拿大|Canada/i },
  { code: 'MX', label: '墨西哥', subregion: '北美', continent: '美洲', pattern: /墨西哥|Mexico/i },
  { code: 'GT', label: '危地马拉', subregion: '北美', continent: '美洲', pattern: /危地馬拉|危地马拉|Guatemala/i },
  { code: 'CU', label: '古巴', subregion: '北美', continent: '美洲', pattern: /古巴|Cuba/i },
  { code: 'PA', label: '巴拿马', subregion: '北美', continent: '美洲', pattern: /巴拿馬|巴拿马|Panama/i },
  { code: 'CR', label: '哥斯达黎加', subregion: '北美', continent: '美洲', pattern: /哥斯達黎加|哥斯达黎加|Costa[ _-]?Rica/i },
  { code: 'BR', label: '巴西', subregion: '南美', continent: '美洲', pattern: /巴西|Brazil/i },
  { code: 'AR', label: '阿根廷', subregion: '南美', continent: '美洲', pattern: /阿根廷|Argentina/i },
  { code: 'CL', label: '智利', subregion: '南美', continent: '美洲', pattern: /智利|Chile/i },
  { code: 'PE', label: '秘鲁', subregion: '南美', continent: '美洲', pattern: /秘魯|秘鲁|Peru/i },
  { code: 'EC', label: '厄瓜多尔', subregion: '南美', continent: '美洲', pattern: /厄瓜多爾|厄瓜多尔|Ecuador/i },
  { code: 'CO', label: '哥伦比亚', subregion: '南美', continent: '美洲', pattern: /哥倫比亞|哥伦比亚|Colombia/i },
  { code: 'VE', label: '委内瑞拉', subregion: '南美', continent: '美洲', pattern: /委內瑞拉|委内瑞拉|Venezuela/i },
  { code: 'UY', label: '乌拉圭', subregion: '南美', continent: '美洲', pattern: /烏拉圭|乌拉圭|Uruguay/i },
  { code: 'BO', label: '玻利维亚', subregion: '南美', continent: '美洲', pattern: /玻利維亞|玻利维亚|Bolivia/i },
  { code: 'PY', label: '巴拉圭', subregion: '南美', continent: '美洲', pattern: /巴拉圭|Paraguay/i },
  { code: 'AU', label: '澳大利亚', subregion: '大洋洲', continent: '大洋洲', pattern: /澳洲|澳大利亞|澳大利亚|Australia/i },
  { code: 'NZ', label: '新西兰', subregion: '大洋洲', continent: '大洋洲', pattern: /紐西蘭|新西兰|New[ _-]?Zealand/i },
  { code: 'EG', label: '埃及', subregion: '北非', continent: '非洲', pattern: /埃及|Egypt/i },
  { code: 'MA', label: '摩洛哥', subregion: '北非', continent: '非洲', pattern: /摩洛哥|Morocco/i },
  { code: 'DZ', label: '阿尔及利亚', subregion: '北非', continent: '非洲', pattern: /阿爾及利亞|阿尔及利亚|Algeria/i },
  { code: 'TN', label: '突尼斯', subregion: '北非', continent: '非洲', pattern: /突尼斯|Tunisia/i },
  { code: 'LY', label: '利比亚',    subregion: '北非', continent: '非洲', pattern: /利比亞|利比亚|Libya/i },
  { code: 'ZA', label: '南非',      subregion: '南非', continent: '非洲', pattern: /南非|South[ _-]?Africa/i },
  { code: 'NG', label: '尼日利亚',  subregion: '南非', continent: '非洲', pattern: /尼日利亞|尼日利亚|Nigeria/i },
  { code: 'KE', label: '肯尼亚',    subregion: '南非', continent: '非洲', pattern: /肯尼亞|肯尼亚|Kenya/i },
  { code: 'ET', label: '埃塞俄比亚', subregion: '南非', continent: '非洲', pattern: /埃塞俄比亞|埃塞俄比亚|Ethiopia/i },
  { code: 'GH', label: '加纳',      subregion: '南非', continent: '非洲', pattern: /加納|加纳|Ghana/i },
  { code: 'TZ', label: '坦桑尼亚',   subregion: '南非', continent: '非洲', pattern: /坦桑尼亞|坦桑尼亚|Tanzania/i },
  { code: 'RU', label: '俄罗斯',     subregion: '东欧', continent: '欧洲', pattern: /俄羅斯|俄罗斯|Russia/i },
  { code: 'AM', label: '亚美尼亚',   subregion: '西亚', continent: '亚洲', pattern: /亞美尼亞|亚美尼亚|Armenia/i },
  { code: 'GE', label: '格鲁吉亚',   subregion: '西亚', continent: '亚洲', pattern: /格魯吉亞|格鲁吉亚|Georgia(?!n)/i },
];

const COUNTRY_AUTO_MIN = 4;
const CONTINENT_COLLAPSE_MAX = 8;
const SUBREGION_AUTO_MIN = 4;

const COUNTRIES_BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));
const FC_SUFFIX = ' · FC';
const LOCATION_INDEX_NAME = 'FC 地区索引';

function stableValue(value) {
  if (Array.isArray(value)) return `[${value.map(stableValue).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${stableValue(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sameGroup(left, right) {
  return stableValue(left) === stableValue(right);
}

function candidateName(baseName, index) {
  if (index === 0) return baseName;
  return index === 1 ? `${baseName}${FC_SUFFIX}` : `${baseName}${FC_SUFFIX} ${index}`;
}

function allocateManagedNames(generatedGroups, existingGroups) {
  const names = new Map();
  const allocated = [];
  const groupsByName = new Map(existingGroups.map((group) => [group && group.name, group]));

  for (const group of generatedGroups) {
    const proxies = group.proxies.map((proxy) => names.get(proxy) || proxy);
    for (let index = 0; ; index += 1) {
      const name = candidateName(group.name, index);
      const desired = { ...group, name, proxies };
      const existing = groupsByName.get(name);
      if (!existing) {
        allocated.push(desired);
        groupsByName.set(name, desired);
        names.set(group.name, name);
        break;
      }
      if (sameGroup(existing, desired)) {
        names.set(group.name, name);
        break;
      }
    }
  }

  return { groups: allocated, names };
}

function classifyProxyName(name) {
  if (typeof name !== 'string' || INFORMATION_PATTERN.test(name)) {
    return { kind: 'information' };
  }

  const matches = new Set(COUNTRIES.filter(({ pattern }) => pattern.test(name)).map(c => c.code));
  const structuredCode = name.match(STRUCTURED_COUNTRY_CODE_PATTERN);
  const structuredCodeValue = structuredCode && structuredCode[1].toUpperCase();
  const structuredCountry = structuredCodeValue && SAFE_STRUCTURED_COUNTRY_CODES.has(structuredCodeValue)
    ? COUNTRIES_BY_CODE.get(structuredCodeValue)
    : undefined;
  if (structuredCountry) matches.add(structuredCountry.code);
  for (const match of name.matchAll(/(?:^|[^A-Za-z])P?(TW|HK|JP|KR|SG|US|CN)(?=[0-9]|$|[^A-Za-z])/gi)) matches.add(match[1].toUpperCase());
  if (matches.size === 1) return { kind: 'country', country: [...matches][0] };
  if (matches.size > 1) return { kind: 'ambiguous', countries: [...matches] };
  if (OPAQUE_NAME_PATTERN.test(name)) return { kind: 'unlocated' };
  return { kind: 'unmatched' };
}

function unique(values) {
  return [...new Set(values)];
}

function makeAutoGroup(name, proxies) {
  return {
    name,
    type: 'url-test',
    url: 'https://cp.cloudflare.com/generate_204',
    interval: 300,
    lazy: true,
    tolerance: 35,
    proxies,
  };
}

function makeSelectGroup(name, childNames) {
  return { name, type: 'select', proxies: unique(childNames) };
}

function buildLocationGroups(proxyNames) {
  const countryBuckets = new Map();
  const sparseSubregions = new Map();
  const continentEntries = new Map();
  const groups = [];
  const countryGroupNames = [];
  const assigned = new Set();
  const diagnostics = {
    classified: 0,
    information: 0,
    unlocated: 0,
    unmatched: 0,
    ambiguous: 0,
    countries: {},
  };

  for (const proxyName of proxyNames) {
    const result = classifyProxyName(proxyName);
    if (result.kind !== 'country') {
      diagnostics[result.kind] += 1;
      continue;
    }

    diagnostics.classified += 1;
    diagnostics.countries[result.country] = (diagnostics.countries[result.country] || 0) + 1;
    const bucket = countryBuckets.get(result.country) || [];
    bucket.push(proxyName);
    countryBuckets.set(result.country, bucket);
  }

  function addContinentEntry(continent, name) {
    const entries = continentEntries.get(continent) || [];
    entries.push(name);
    continentEntries.set(continent, entries);
  }

  function addLeaf(name, proxies) {
    for (const proxyName of proxies) {
      if (assigned.has(proxyName)) {
        throw new Error(`raw proxy assigned to multiple generated groups: ${proxyName}`);
      }
      assigned.add(proxyName);
    }
    groups.push(makeAutoGroup(name, proxies));
  }

  for (const [countryCode, proxies] of countryBuckets) {
    const country = COUNTRIES_BY_CODE.get(countryCode);
    if (proxies.length >= COUNTRY_AUTO_MIN) {
      const name = `Auto ${country.label}`;
      addLeaf(name, proxies);
      countryGroupNames.push(name);
      addContinentEntry(country.continent, name);
      continue;
    }

    const key = `${country.continent}\u0000${country.subregion}`;
    const bucket = sparseSubregions.get(key) || {
      continent: country.continent,
      subregion: country.subregion,
      proxies: [],
    };
    bucket.proxies.push(...proxies);
    sparseSubregions.set(key, bucket);
  }

  const sparseContinents = new Map();
  for (const subregion of sparseSubregions.values()) {
    const buckets = sparseContinents.get(subregion.continent) || [];
    buckets.push(subregion);
    sparseContinents.set(subregion.continent, buckets);
  }

  for (const [continent, subregions] of sparseContinents) {
    const total = subregions.reduce((sum, { proxies }) => sum + proxies.length, 0);
    if (total <= CONTINENT_COLLAPSE_MAX) {
      const name = `Auto ${continent}其他`;
      addLeaf(name, subregions.flatMap(({ proxies }) => proxies));
      addContinentEntry(continent, name);
      continue;
    }

    const remainder = [];
    for (const { subregion, proxies } of subregions) {
      if (proxies.length >= SUBREGION_AUTO_MIN) {
        const name = `Auto ${subregion}`;
        addLeaf(name, proxies);
        addContinentEntry(continent, name);
      } else {
        remainder.push(...proxies);
      }
    }

    if (remainder.length > 0) {
      const name = `Auto ${continent}其他`;
      addLeaf(name, remainder);
      addContinentEntry(continent, name);
    }
  }

  const continentEntryNames = [];
  for (const [continent, childNames] of continentEntries) {
    const entries = unique(childNames);
    if (entries.length === 1) {
      continentEntryNames.push(entries[0]);
      continue;
    }
    if (entries.length > 1) {
      groups.push(makeSelectGroup(continent, entries));
      continentEntryNames.push(continent);
    }
  }

  if (continentEntryNames.length > 1) {
    groups.push(makeSelectGroup('地区选择', continentEntryNames));
  }

  return { groups, diagnostics, countryGroupNames, continentEntryNames };
}

const NETWORK_POLICY_PROVIDERS = {
  private: {
    type: 'http', behavior: 'domain',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/private.txt', interval: 86400,
  },
  reject: {
    type: 'http', behavior: 'domain',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/reject.txt', interval: 86400,
  },
  direct: {
    type: 'http', behavior: 'domain',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/direct.txt', interval: 86400,
  },
  'ai-claude': {
    type: 'file', behavior: 'domain',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/ai-claude.yaml',
  },
  'ai-perplexity': {
    type: 'file', behavior: 'domain',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/ai-perplexity.yaml',
  },
  'ai-cn': {
    type: 'file', behavior: 'domain',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/ai-cn.yaml',
  },
  'ai-typeless': {
    type: 'file', behavior: 'domain',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/ai-typeless.yaml',
  },
  proxy: {
    type: 'http', behavior: 'domain',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/proxy.txt', interval: 86400,
  },
  gfw: {
    type: 'http', behavior: 'domain',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/gfw.txt', interval: 86400,
  },
  cncidr: {
    type: 'http', behavior: 'ipcidr',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/cncidr.txt', interval: 86400,
  },
  lancidr: {
    type: 'http', behavior: 'ipcidr',
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
    path: '/Users/fc/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/ruleset/lancidr.txt', interval: 86400,
  },
};

function main(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('FC policy: expected a configuration object');
  }
  // This manifest makes reapplication deterministic. Only exact, previously
  // generated values are removed; changed supplier/user values are preserved.
  const prior = config['x-fc-policy'];
  if (prior && prior.version === 1) {
    config['proxy-groups'] = (config['proxy-groups'] || []).filter(g =>
      !(prior.groups || []).some(old => sameGroup(old, g)));
    config.rules = (config.rules || []).filter(r => !(prior.rules || []).includes(r));
    for (const [name, value] of Object.entries(prior.providers || {})) {
      if (sameGroup(config['rule-providers']?.[name], value)) delete config['rule-providers'][name];
    }
  }
  const proxies = Array.isArray(config.proxies) ? config.proxies : [];
  const originalGroups = Array.isArray(config['proxy-groups']) ? config['proxy-groups'] : [];
  const originalRules = Array.isArray(config.rules) ? config.rules : [];
  const groups = [...originalGroups];
  const generated = [];
  const nodeNames = new Set(proxies.map(p => p.name));
  const proxyProviderNames = Object.keys(config['proxy-providers'] || {});
  const builtin = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', 'COMPATIBLE']);
  const byName = new Map(groups.map(g => [g.name, g]));

  function add(base, definition) {
    for (let index = 0; ; index++) {
      const name = candidateName(base, index);
      const desired = { name, ...definition };
      if (builtin.has(name) || nodeNames.has(name) || proxyProviderNames.includes(name)) continue;
      if (byName.has(name)) {
        if (sameGroup(byName.get(name), desired)) return name;
        continue;
      }
      byName.set(name, desired);
      groups.push(desired);
      generated.push(desired);
      return name;
    }
  }
  function select(name, members) {
    return add(name, { type: 'select', proxies: unique(members) });
  }
  function auto(name, members) {
    const { name: unused, ...definition } = makeAutoGroup(name, members);
    return add(name, definition);
  }
  function unavailable(reason) {
    return select('FC-' + reason, ['REJECT']);
  }

  const location = buildLocationGroups([...nodeNames]);
  const locationNames = new Map();
  for (const g of location.groups) {
    const { name, ...definition } = g;
    definition.proxies = g.proxies.map(n => locationNames.get(n) || n);
    locationNames.set(name, add(name, definition));
  }
  const locationLeaves = location.groups.filter(g => g.type === 'url-test').map(g => locationNames.get(g.name));
  if (locationLeaves.length) add(LOCATION_INDEX_NAME, { type: 'select', hidden: true, proxies: locationLeaves });

  const usable = proxies.filter(p => p && typeof p.name === 'string'
    && !['direct', 'reject', 'dns', 'pass'].includes(String(p.type).toLowerCase())
    && classifyProxyName(p.name).kind !== 'information');
  const countryNodes = code => usable.filter(p => {
    const c = classifyProxyName(p.name);
    return c.kind === 'country' && c.country === code;
  }).map(p => p.name);
  // Restricted services use country-specific leaves even for just one node.
  // Never trust a supplier's group name as evidence of its actual geography.
  const countryAuto = new Map();
  for (const code of ['JP', 'SG', 'US', 'TW', 'KR']) {
    const nodes = countryNodes(code);
    if (nodes.length) countryAuto.set(code, auto('Auto ' + COUNTRIES_BY_CODE.get(code).label, nodes));
  }

  const rawGroupNames = new Set(originalGroups.map(g => g.name));
  const terminal = [...originalRules].reverse().find(r => /^MATCH\s*,/i.test(r));
  const terminalTarget = terminal && terminal.split(',')[1].trim();
  const roots = unique([terminalTarget, 'Proxy', 'PROXY', 'Paxora', '选择终端节点', '蓝莓桥',
    ...originalGroups.filter(g => g.type === 'select').map(g => g.name),
    ...originalGroups.map(g => g.name)].filter(n => n && rawGroupNames.has(n)));
  let upstreamMembers = roots.length ? unique([roots[0], ...['自动选择', '故障转移', '自动'].filter(n => rawGroupNames.has(n))]) : usable.map(p => p.name);
  let fcUpstreamName;
  if (!upstreamMembers.length && proxyProviderNames.length) {
    fcUpstreamName = add('FC-Upstream', { type: 'select', proxies: [], use: proxyProviderNames, 'empty-fallback': 'REJECT' });
  } else {
    if (!upstreamMembers.length) upstreamMembers = [unavailable('无可用节点')];
    fcUpstreamName = select('FC-Upstream', upstreamMembers);
  }
  const fcProxyName = select('FC-Proxy', [fcUpstreamName,
    ...['TW', 'JP', 'SG'].map(c => countryAuto.get(c)).filter(Boolean),
    ...[locationNames.get('Auto 香港'), countryAuto.get('US')].filter(Boolean), 'DIRECT']);

  const usProxies = countryNodes('US');
  function numberedUs(min, max) {
    return usProxies.filter(n => {
      const match = n.match(/高[带帶][宽寬]\s*[专專][线線]\s*(\d+)(?:\D|$)/);
      return match && +match[1] >= min && +match[1] <= max;
    }).sort((a,b) => +a.match(/[专專][线線]\s*(\d+)/)[1] - +b.match(/[专專][线線]\s*(\d+)/)[1]);
  }
  const aiPreferred = numberedUs(1,5);
  const musePreferred = numberedUs(3,6);
  const noUs = usProxies.length ? null : unavailable('无美国节点');
  const aiUsAutoName = usProxies.length ? auto('AI-US-Auto', aiPreferred.length ? aiPreferred : usProxies) : null;
  const aiUsName = select('AI-US', usProxies.length
    ? [aiUsAutoName, ...(aiPreferred.length ? aiPreferred : usProxies), countryAuto.get('US')]
    : [noUs]);
  const museUsName = select('AI-Muse-US', usProxies.length
    ? [...musePreferred, ...usProxies, countryAuto.get('US')]
    : [noUs]);
  const safeAi = ['JP','SG','US','TW','KR'].map(c => countryAuto.get(c)).filter(Boolean);
  const aiFallback = safeAi.length ? safeAi : [unavailable('无合规AI节点')];
  const actualServiceNames = new Map();
  for (const name of ['AI-OpenAI','AI-Qwen','AI-Claude','AI-Gemini','AI-Perplexity','AI-Grok','AI-Typeless']) {
    let members = aiFallback;
    if (name === 'AI-Claude' || name === 'AI-Grok') members = usProxies.length ? [aiUsName, ...safeAi] : aiFallback;
    actualServiceNames.set(name, select(name, members));
  }
  actualServiceNames.set('AI-CN', select('AI-CN', ['DIRECT', fcProxyName]));
  actualServiceNames.set('APP-NAS', select('APP-NAS', ['DIRECT', ...[countryAuto.get('TW')].filter(Boolean), fcProxyName]));
  actualServiceNames.set('Web3', select('Web3', [...[locationNames.get('Auto 香港'),countryAuto.get('SG'),countryAuto.get('US')].filter(Boolean), fcProxyName, 'DIRECT']));
  const serviceName = name => actualServiceNames.get(name) || name;

  const additions = [
    `PROCESS-NAME,WhatsApp,${fcProxyName}`,
    `DOMAIN-SUFFIX,muse.ai,${museUsName}`,
    `DOMAIN-SUFFIX,muse.xn,${museUsName}`,
    `DOMAIN-SUFFIX,metaaivm.com,${museUsName}`,
    `DOMAIN,hatch-api.meta.ai,${museUsName}`,
    `DOMAIN,gateway.meta.ai,${museUsName}`,
    `DOMAIN,edge-chat-latest.meta.ai,${museUsName}`,
    `DOMAIN,edge-chat.meta.ai,${museUsName}`,
    `DOMAIN,shortwave.meta.ai,${museUsName}`,
    `PROCESS-NAME,cloud-drive-daemon,${serviceName('APP-NAS')}`,
    `PROCESS-NAME,cloud-drive-connect,${serviceName('APP-NAS')}`,
    `DOMAIN-SUFFIX,openai.com,${serviceName('AI-OpenAI')}`,
    `DOMAIN-SUFFIX,chatgpt.com,${serviceName('AI-OpenAI')}`,
    `DOMAIN-SUFFIX,oaistatic.com,${serviceName('AI-OpenAI')}`,
    `DOMAIN-SUFFIX,oaiusercontent.com,${serviceName('AI-OpenAI')}`,
    `DOMAIN-SUFFIX,anthropic.com,${serviceName('AI-Claude')}`,
    `DOMAIN-SUFFIX,claude.ai,${serviceName('AI-Claude')}`,
    `DOMAIN-SUFFIX,claude.com,${serviceName('AI-Claude')}`,
    `DOMAIN-SUFFIX,generativelanguage.googleapis.com,${serviceName('AI-Gemini')}`,
    `DOMAIN-SUFFIX,aistudio.google.com,${serviceName('AI-Gemini')}`,
    `DOMAIN-SUFFIX,ai.google.dev,${serviceName('AI-Gemini')}`,
    `DOMAIN-SUFFIX,gemini.google.com,${serviceName('AI-Gemini')}`,
    `DOMAIN-SUFFIX,perplexity.ai,${serviceName('AI-Perplexity')}`,
    `DOMAIN-SUFFIX,x.ai,${serviceName('AI-Grok')}`,
    `DOMAIN-SUFFIX,typeless.ai,${serviceName('AI-Typeless')}`,
    `DOMAIN-SUFFIX,typeless.com,${serviceName('AI-Typeless')}`,
    `DOMAIN-SUFFIX,typeless-static.com,${serviceName('AI-Typeless')}`,
    `DOMAIN-SUFFIX,deepseek.com,${serviceName('AI-CN')}`,
    `DOMAIN-SUFFIX,pan.quark.cn,${serviceName('AI-CN')}`,
    `DOMAIN-SUFFIX,open-api-drive.quark.cn,${serviceName('AI-CN')}`,
    `DOMAIN-SUFFIX,qwencloud.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,qianwen.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,qwen.ai,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,qwenlm.ai,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,tongyi.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,tongyi.aliyun.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,dashscope.aliyuncs.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,dashscope-intl.aliyuncs.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,maas.aliyuncs.com,${serviceName('AI-Qwen')}`,
    `DOMAIN-KEYWORD,qwen,${serviceName('AI-Qwen')}`,
    `DOMAIN-KEYWORD,qianwen,${serviceName('AI-Qwen')}`,
    `DOMAIN-KEYWORD,tongyi,${serviceName('AI-Qwen')}`,
    `DOMAIN-KEYWORD,dashscope,${serviceName('AI-Qwen')}`,
    `DOMAIN-SUFFIX,github.com,${fcProxyName}`,
    `DOMAIN-SUFFIX,githubassets.com,${fcProxyName}`,
    `DOMAIN-SUFFIX,githubusercontent.com,${fcProxyName}`,
    `DOMAIN-SUFFIX,github.io,${fcProxyName}`,
    `DOMAIN-SUFFIX,githubcopilot.com,${fcProxyName}`,
    `DOMAIN-SUFFIX,t.me,${fcProxyName}`,
    `DOMAIN-SUFFIX,tdesktop.com,${fcProxyName}`,
    `DOMAIN-SUFFIX,telegra.ph,${fcProxyName}`,
    `DOMAIN-SUFFIX,telegram.me,${fcProxyName}`,
    `DOMAIN-SUFFIX,telegram.org,${fcProxyName}`,
    `DOMAIN-SUFFIX,telesco.pe,${fcProxyName}`,
    `DOMAIN-SUFFIX,walletconnect.org,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,walletconnect.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,metamask.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,phantom.app,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,rabby.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,safe.global,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,trustwallet.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,infura.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,alchemy.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,alchemyapi.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,ankr.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,quicknode.pro,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,chainstack.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,drpc.org,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,blastapi.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,blocknative.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,etherscan.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,arbiscan.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,polygonscan.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,bscscan.com,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,basescan.org,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,solscan.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,uniswap.org,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,1inch.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,opensea.io,${serviceName('Web3')}`,
    `DOMAIN-SUFFIX,aave.com,${serviceName('Web3')}`,
    `IP-CIDR,91.108.0.0/16,${fcProxyName},no-resolve`,
    `IP-CIDR,95.161.64.0/20,${fcProxyName},no-resolve`,
    `IP-CIDR,109.239.140.0/24,${fcProxyName},no-resolve`,
    `IP-CIDR,149.154.160.0/20,${fcProxyName},no-resolve`,
    `IP-CIDR6,2001:67c:4e8::/48,${fcProxyName},no-resolve`,
    `IP-CIDR6,2001:b28:f23d::/48,${fcProxyName},no-resolve`,
    `IP-CIDR6,2001:b28:f23f::/48,${fcProxyName},no-resolve`,
  ];

  const providers = { ...(config['rule-providers'] || {}) };
  const generatedProviders = {};
  const providerNames = new Map();
  for (const [base, spec] of Object.entries(NETWORK_POLICY_PROVIDERS)) {
    for (let i = 0; ; i++) {
      const name = i ? base + '-fc' + (i === 1 ? '' : '-' + i) : base;
      if (providers[name] && !sameGroup(providers[name], spec)) continue;
      if (!providers[name]) { providers[name] = spec; generatedProviders[name] = spec; }
      providerNames.set(base, name);
      break;
    }
  }
  const policyPairs = [
    ['private','DIRECT'], ['reject','REJECT'], ['lancidr','DIRECT'],
    ['ai-claude',serviceName('AI-Claude')], ['ai-perplexity',serviceName('AI-Perplexity')],
    ['ai-cn',serviceName('AI-CN')], ['ai-typeless',serviceName('AI-Typeless')],
    ['direct','DIRECT'], ['cncidr','DIRECT'], ['proxy',fcProxyName], ['gfw',fcProxyName],
  ];
  const restrictedServices = new Set([aiUsName, museUsName,
    ...[...actualServiceNames].filter(([role]) => role.startsWith('AI-') && role !== 'AI-CN').map(([,name]) => name)]);
  const desiredRules = unique([...additions, ...policyPairs.map(([p,t]) => `RULE-SET,${providerNames.get(p)},${t}`)]).flatMap(rule => {
    const parts = rule.split(',');
    const target = parts.pop();
    // Mihomo skips a matching proxy rule when its selected node cannot carry
    // UDP. Stop that same packet before it can fall through to a supplier's
    // DIRECT/HK/default rule. Supported UDP continues through the first rule.
    return restrictedServices.has(target)
      ? [rule, `AND,((${parts.join(',')}),(NETWORK,UDP)),REJECT`]
      : [rule];
  });
  // Move exact existing policy rules forward, while keeping all other supplier
  // rules in their original relative order. Never leave an AI rule behind MATCH.
  const desiredSet = new Set(desiredRules);
  const rest = originalRules.filter(r => !desiredSet.has(r));
  const fallback = originalRules.some(r => /^MATCH\s*,/i.test(r)) ? [] : [`MATCH,${fcProxyName}`];
  config.rules = [...desiredRules, ...rest, ...fallback];
  config['proxy-groups'] = groups;
  config['rule-providers'] = providers;

  const previousDns = config.dns && typeof config.dns === 'object' ? config.dns : {};
  config.dns = Object.assign({}, previousDns, {
    enable: true,
    ipv6: false,
    'enhanced-mode': previousDns['enhanced-mode'] || 'fake-ip',
    'fake-ip-range': previousDns['fake-ip-range'] || '198.18.0.1/16',
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [
      `https://dns.google/dns-query#${fcProxyName}`,
      `https://cloudflare-dns.com/dns-query#${fcProxyName}`,
    ],
    'proxy-server-nameserver': [
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
    ],
    'direct-nameserver': [
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
    ],
    'direct-nameserver-follow-policy': false,
    'respect-rules': false,
  });

  config['x-fc-policy'] = { version: 1, groups: generated,
    rules: [...desiredRules.filter(r => !originalRules.includes(r)), ...fallback], providers: generatedProviders };
  validateFcConfig(config);
  return config;
}

function validateFcConfig(config) {
  const builtin = new Set(['DIRECT','REJECT','REJECT-DROP','PASS','COMPATIBLE']);
  const groups = config['proxy-groups'] || [];
  const nodes = config.proxies || [];
  const names = [...nodes.map(p => p.name), ...groups.map(g => g.name)];
  if (new Set(names).size !== names.length) throw new Error('FC policy: duplicate proxy/group names in source');
  const valid = new Set([...builtin, ...names]);
  const byName = new Map(groups.map(g => [g.name, g]));
  for (const g of groups) {
    if (!(g.proxies?.length || g.use?.length || g['include-all'] || g['include-all-proxies'] || g['include-all-providers'])) throw new Error('FC policy: empty group '+g.name);
    for (const n of g.proxies || []) if (!valid.has(n)) throw new Error('FC policy: missing group member '+n);
    for (const n of g.use || []) if (!config['proxy-providers']?.[n]) throw new Error('FC policy: missing proxy-provider '+n);
  }
  function visit(name, path) {
    if (path.has(name)) throw new Error('FC policy: group cycle '+name);
    const g = byName.get(name);
    if (g) for (const n of g.proxies || []) visit(n, new Set([...path,name]));
  }
  for (const g of groups) visit(g.name,new Set());
  // Targets precede trailing no-resolve/src parameters, including
  // logical AND/OR expressions. SUB-RULE targets belong to a separate namespace.
  for (const r of config.rules || []) {
    if (typeof r !== 'string') throw new Error('FC policy: invalid rule');
    // Logical-rule payloads contain commas, but still have three top-level
    // fields. Do not consume a real target named "src" or "no-resolve".
    const parts = [];
    let depth = 0;
    let start = 0;
    const logical = /^(AND|OR|NOT|SUB-RULE)\s*,/i.test(r);
    for (let i = 0; i < r.length; i++) {
      if (logical && r[i] === '(') depth++;
      if (logical && r[i] === ')') depth--;
      if (r[i] === ',' && depth === 0) { parts.push(r.slice(start,i).trim()); start = i + 1; }
    }
    parts.push(r.slice(start).trim());
    const minimumFields = parts[0].toUpperCase() === 'MATCH' ? 2 : 3;
    while (parts.length > minimumFields && ['no-resolve','src'].includes(parts.at(-1)?.toLowerCase())) parts.pop();
    const target = parts.at(-1);
    if (parts[0].toUpperCase() === 'SUB-RULE') {
      if (!config['sub-rules']?.[target]) throw new Error('FC policy: missing sub-rule '+target);
    } else if (!valid.has(target)) throw new Error('FC policy: missing rule target '+target);
    if (parts[0].toUpperCase() === 'RULE-SET' && !config['rule-providers']?.[parts[1]]) throw new Error('FC policy: missing rule-provider '+parts[1]);
  }
}
