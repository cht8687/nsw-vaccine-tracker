require('dotenv').config()
const differenceInDays = require('date-fns/differenceInDays');
const parseISO = require('date-fns/parseISO');
const format = require('date-fns/format');
const R = require('ramda');
const say = require('say');
const chalk = require("chalk");
const boxen = require("boxen");
const inquirer = require('inquirer');
const { getAvailability } = require('./api');

inquirer.registerPrompt('datepicker', require('inquirer-datepicker'));
/* Console Texts */
const greeting = chalk.white.bold("Weclome to NSW Vaccine Tracker 1.0");
const check_for_you = chalk.green.bold("Checking for you. Please wait...");
const check_failed = chalk.red.bold("Something wrong!");
const check_again = chalk.green.bold("Checking for you again. Please wait...");
const nothing_found = chalk.green.bold("Nothing found.");
const search_again = chalk.green.bold("Search again...");

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "green",
  backgroundColor: "#555555"
};
const introText = boxen(greeting, boxenOptions);

// target date variable...hacky
let targetDate;

const isDateMeet = R.where({
  available: R.equals(true),
  noOfSlots: R.gte(R.__, 1),
  start_date: R.pipe(
    parseISO,
    date => (differenceInDays(targetDate, date)),
    R.gte(R.__, 0)
  )
});

const formatInstances = R.map(
  R.pipe(
    R.pick(['start_date', 'available', 'noOfSlots']),
    R.applySpec({
      Date: R.prop('start_date'),
      Slots: R.prop('noOfSlots')
    })
  )
)

const reportFound = result => {
  R.cond(
    [
      [R.gt(R.__, 0), R.always(
        say.speak(`Hi, found ${result.length} available slots before ${format(targetDate, 'MMMM dd')}`)
      )],
      [R.T, () => console.log(nothing_found)]
    ]
  )(result.length);
  console.log('found following days: ')
  console.log(formatInstances(result))
  console.log(search_again)
}

const alertWhenDateAvailable = result => {
  return R.pipe(
    R.filter(
      isDateMeet
    ),
    R.length,
    R.ifElse(
      R.gt(R.__, 0),
      R.always(reportFound(
        R.filter(
          isDateMeet
        )(result)
      )),
      R.always(() => {
        console.log(`No date found before ${parseISO(targetDate)}`);
        console.log('fetching for you again');
      })
    )
  )(result)
}

function fetchData() {
  getAvailability.then(data => {
    alertWhenDateAvailable(data.data.result.data)
  }).catch(
    err => {
      console.log(err)
      console.log(check_failed);
      console.log(check_again);
    }
  );
}

console.log(introText);
inquirer
  .prompt({
    type: 'datepicker',
    name: 'date',
    message: 'Select a max date time: ',
    default: new Date('2021-09-30 19:00:00'),
  })
  .then((answers) => {
    targetDate = answers.date
    console.log(check_for_you);
    setInterval(fetchData, 60000);
  })
  .catch((error) => {
    if (error.isTtyError) {
    } else {
      console.log(error)
    }
  });


