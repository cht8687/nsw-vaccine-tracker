const R = require('ramda');
const axios = require('axios').default;
const { LOCATIONS_ID, LOCATIONS_DICTIONARY } = require('../constants');

const translateArgs = args => {
  const result = R.applySpec({
    location: R.pipe(
      R.prop('location'),
      R.prop(R.__, LOCATIONS_DICTIONARY()),
      R.prop(R.__, LOCATIONS_ID()))
  })(args);
  return result;
}

const instance = axios.create({
  baseURL: 'https://nswhvam.health.nsw.gov.au/api',
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
    'Content-Length': '440',
    Connection: 'keep-alive',
    'Content-Type': 'application/json;charset=UTF-8',
    Cookie: process.env.cookie,
    'X-UserToken': process.env.user_token,
    Host: 'nswhvam.health.nsw.gov.au',
    Origin: 'https://nswhvam.health.nsw.gov.au',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  }
});

const defaultPayload = { "start_date": "2021-08-05 14:00:00.000", "end_date": "2021-08-30 13:59:59.000", "max_date": "2021-11-24 13:00:00.000", "location": "a52d0db2db59fc10071b553af4961953", "catalog_id": "1acda67a3b512010c24e870044efc435", "opened_for": "48e0b3a91bf130d0643664ab274bcbc2", "vaccine_model": "00bd516adbc8f01099e4fde1f3961984", "full_day": false, "task_table": "sn_vaccine_sm_task", "view": "portal", "get_next_available_slot": true, "get_next_available_day_data": true }



const getAvailability = args => instance.post('/sn_vaccine_sm/appointment/availability',
  {
    ...defaultPayload,
    ...translateArgs(args)
  }
)

module.exports = {
  getAvailability
}
