const { hasUncaughtExceptionCaptureCallback } = require('process');
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

launch();

async function launch() {
  const welcomeMessage = `You don’t know how you survived your last encounter with space pirates\nBut it seems luck was on your side\n...well not entirely\nYou’re ECM (electronic control module) was damaged in your last emergency jump drive.\nWithout the ECM you’re unable to switch fuel types, making another jump out the Virgo system, back to Orin, your home system, impossible.\n\nAre you ready?`;
  let answer = await ask(welcomeMessage);
  if (answer !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log('Alert: Your hydrogen fuel levels are critical, immediate refueling required!!!!');
  }

  let firstStep = await ask('What are you going to do?\nyou can check fuel by pulling lever\nDo you pull lever\nyes or no? ')
  // ------------------remember to san-----------------
  if (firstStep !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log(`\nYou estimate roughly 4 hours of flight time left with your remaining hydrogen fuel.\nyou will need to find a way to fix your ECM to make a Quantum jump \nor...you will be stuck floating in this system forever.\n\nBy stroke of pure luck your radar picks up a larger vessel relatively close by.`)
  }
  let nextStep = await ask('Should you land on the ship?\nyes or no? ')
  if (nextStep !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log('you land on the ship\'s hangar')
  }
  return hangar()
}

let powerOn = false
hangar()

async function hangar() {
  let hangarQ = await ask('You notice a light flickering and as you look around you notice the ship has lost power\n the ship is sinking closer to a black hole\nYou need to find this ships ECM to fix your ship before the black hole consumes you and the ship\nyou find a blueprint of the ship\nthe blueprint says the ship\'s spare parts are in the Engine Block\ndo you take the blueprint with you?\ntake or leave ')
  if (hangarQ !== 'leave') {
    console.log('Wow how rude other castaways might need the blueprint aswell')
    // blueprint has posion so if you hold it for too long you die 
    console.log('\ndes of how you die')
    process.exit()
  } else {
    //edit this maybe
    console.log('that was the right choice')
  }
  let secHangarQ = await ask('\nyou look around and notice that there are three doors on the hangar\none to the east\none to the west\none to the south\nwhich door do you want to enter')
  while (secHangarQ === 'east' || secHangarQ === 'west' || secHangarQ === 'south') {
    if (secHangarQ === 'east') {
      if (powerOn === true) {
        console.log('This is the Hangar Control Room')
        hangarControl()
        break;
      } else {
        console.log('\nYou need to turn the power on to open this door')
        secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
      }
    }         // Also need south "else if" also have "else" = death
    else if (secHangarQ === 'west') {
      let westCode = await ask('Passcode please ')
      if (westCode !== '1223') {
        console.log(('\nIncorrect Passcode'))
        secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
      } else {
        console.log('Welcome to the Engine Block')
        engineBlock()
        break
      }
    }
  }
}

engineBlock()

async function engineBlock() {
  let engineBlockQ = await ask('howdy')
}

hangarControl()

async function hangarControl() {
  let hangarControlQ = await ask('howdy')
}
/*async function messHall(){
  let messHallQ = await ask('howdy)
}
async function powerStation() {

}

*/