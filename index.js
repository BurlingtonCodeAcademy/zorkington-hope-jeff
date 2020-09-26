const { hasUncaughtExceptionCaptureCallback } = require('process');
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
// --------------------------------------- player object---------------------------------
const player = {
  location: 'hangar',
  status: 'tired',
  inventory: [],
  changeStatus: function () {
    let newStatus = 'fully loaded'
    this.status = newStatus
  }
}


//-------------------------------- room generator ------------------------------------
//room class with descriptions
class Room {
  constructor(name, description, [inv], locked, power) {
    this.name = name,
      this.desc = description,
      this.inv = [inv],
      this.locked = locked
      this.power = power
  }
  changePower(){
    this.power = true
  }
  changeLock() {
    this.locked = false
  }

  moveBetweenRooms(move) {
    moveToNewRoom(move)
  }
}
const hangar = new Room('hangar', 'You are now in the Hangar.\n\nYou find yourself in a dimly-lit room. The air around you is cold and stale. There is a workbench nearby with tools, anti-static equipment and a blueprint. There are three doors leading out.\n ', ['Blueprint'], false, true) 
const engineBlock = new Room('Engine Block', 'You are now in the Engine Block ', ['ECM'], true, true)
const hangarControlRoom = new Room('Hangar Control Room', 'You find yourself standing before the hangar control room door. ', ['coveralls'], true, false)
const officerQuarters = new Room('Officer Quarters', 'You are now in the officer quarters.\nAround the room, you see bunked beds, chairs, and writing tables. On the wall above a writing table is a bulletin board full of schedules, duty rosters ... and a random notepad with something scrawled upon it. ', ['notepad'], true, true)
const messHall = new Room('Mess Hall', 'You are now in the mess hall.\nIt appears that the last meal listed on the menu board was Taco Suprise. You are not feeling particularly hungry but thirst is gnawing at you. ', ['energyDrink', 'Coffee Cup'], false, true)
const generatorRoom = new Room('Generator Room', 'You are now in the generator room.\n As you move through the archway into this room, you notice various consoles full of buttons and gauges, shelves with parts bins stacked up, as well as a pile of spare parts, including a fuse, laid out upon a small workbench. ', ['fuse'], false, true)

//item class with descriptions
class Item {
  constructor(name, description, takeable) {
    this.name = name,
      this.desc = description,
      this.takeable = takeable
  }

}
const energyDrink = new Item('Energy Drink', 'That energy drink sure looks refreshing.', true)
const coveralls = new Item('coveralls', 'Coveralls are worn by the enlisted staff.', false)
const ECM = new Item('ECM', 'The ECM is necessary to switch fuels for a quantum jump.', true)
const coffeeCup = new Item('Coffee Cup', 'Caffeine makes the days fly by.', false)
const journal = new Item('Journal', 'This is a daily record kept by officers.', false)
const notepad = new Item('notepad', 'I should probably remember this: 1223.', true)
const blueprint = new Item('Blueprint', 'At the bottom of the blueprint, it reads: thanks for all the fish.', true)
const key = new Item('Officer Quarters key', 'This key grants access to the Officer Quarters.', true)
const fuse = new Item('Fuse', "generic fuse, probably useful somehow", true)
// -------------------------------- transition rules ------------------------------------
//allowable room transitions
let shipRooms = {
  hangar: { canChangeTo: ['engineBlock', 'hangarControlRoom', 'messHall'] },
  hangarControlRoom: { canChangeTo: ['hangar', 'officerQuarters'] },
  engineBlock: { canChangeTo: ['hangar', 'messHall'] },
  officerQuarters: { canChangeTo: ['hangarControlRoom', 'messHall'] },
  messHall: { canChangeTo: ['generatorRoom', 'officerQuarters', 'engineBlock', 'hangar'] },
  generatorRoom: { canChangeTo: ['messHall'] }
}

//--------------------------------- Lookup Tables --------------------------

//Lookup table for allowable movement or action by the player
let playerMovements = {
  move: ['west', 'east', 'north', 'south'],
  drink: ['take a drink', 'drink'],
  take: ['take'],
  leave: ['leave', 'drop'],
}

//Lookup table for room names
let roomsLookUp = {
  'hangarControlRoom': hangarControlRoom,
  'engineBlock': engineBlock,
  'messHall': messHall,
  'officerQuarters': officerQuarters,
  'hangar': hangar,
  'generatorRoom': generatorRoom,
}

//Lookup table for inventory items
let itemLookUp = {
  'Energy Drink': energyDrink,
  "coveralls": coveralls,
  'ECM': ECM,
  'Coffee Cup': coffeeCup,
  'Journal': journal,
  'notepad': notepad,
  'Blueprint': blueprint,    
  'key': key,
  "fuse": fuse
}

//------------------------------ movement to and from rooms -------------------------------

async function moveToNewRoom(newRoom) {
  let changeRoom = shipRooms[player.location].canChangeTo;
  if (changeRoom.includes(newRoom)) {
    if (player.inventory.includes['fuse']){
      hangarControlRoom['changePower']()
    } else{
      console.log('')}
    if (player.inventory.includes('key')){
      officerQuarters['changeLock']()
    }
    if (roomsLookUp[newRoom].locked) {
      console.log('This room is locked. ')
    } else {
      player.location = newRoom
    }                                         
  } else {
    console.log('You cant go that way! ')
  }
}

//unlocking the engine block room
async function passcodeEngineBlock(){
  let passcodeQ = await ask('What is the Passcode ')
  if (passcodeQ === '1223'){
    engineBlock.locked = false
    console.log('Access Granted ')
  } else{
    console.log('incorrect passcode ')
  }
}

// async function turnPowerOnInHangarControlRoom(){
//   if (hangarControlRoom.power === true){
//     console.log('Access Granted ')
//   } else {
//     console.log('The door\'s control panel seems fried; however, it seems like an easy fix... You\'ll just need to replace the fuse.')
//   }

// }
// --------------------------- The game story code is below this line ---------------------------
launch();

async function launch() {
  const welcomeMessage = `You don’t know how you survived your last encounter with space pirates.\nBut it seems luck was on your side\n...Well not entirely.\nYour ECM (electronic control module) was damaged in your last emergency jump drive.\nWithout the ECM you’re unable to switch fuel types, making another quantum jump out the Virgo system, back to Orin, your home system, impossible.\n\nAre you ready? `;
  let answer = await ask(welcomeMessage);
  if (answer !== 'yes') {
    console.log('okay you die then')
    process.exit()
  } else {
    console.log('Alert: Your hydrogen fuel levels are critical. Immediate refueling required!!!');
  }
  let hydroResponse = await ask('What are you going to do?\nyou can check fuel by pulling the lever.\nDo you pull the lever\nyes or no? ')
  // ------------------remember to sanitize, be descriptive with variable names-----------------
  if (hydroResponse !== 'yes') {
    console.log('By not pulling the lever your fuel runs out and you die...blissfully ignorant')
    process.exit()
  } else {
    console.log(`\nYou estimate roughly 4 hours of flight time left with your remaining hydrogen fuel.\nYou will need to find a replacement ECM to make a Quantum jump or ... you will be stuck floating in this system forever.\n\nBy stroke of pure luck your radar picks up a much larger vessel relatively close by.`)
  }
  let nextStep = await ask('Should you land on the ship?\nyes or no? ')
  if (nextStep !== 'yes') {
    console.log('Well...you have succumbed to the vast, cold emptiness of space.')
    process.exit()
  } else {
    console.log('You touch down on the ship\'s landing pad.')
  }
  console.log('You notice a light flickering above the dimly lit hangar, and as you continue your initial obeservations, it becomes quite apparent that the ship has lost power.\nThe ship is sinking closer to a black hole!\nYou need to find this ship\'s replacement ECM to repair your ship before the black hole consumes you and the ship.\n\n\nYou can change rooms by typing "move"\nYou can take an item for your inventory by typing "take".\nYou can drop an item by typing "drop".\nTo check your inventory type "check inventory"\nTo check your status type "status".\nTo read an item type "read"\n\n')

  let blueprintQ = await ask('You find a blueprint of the ship.\nThe blueprint says the ship\'s spare parts are in the Engine Block.\n do you take or leave. ')
  if (blueprintQ === 'leave'){
    console.log('you put the blueprint back down')
  } else{
    console.log('Oh no, the poison left on the blueprint spreads throughout your body and you have now died')
    process.exit()
  }


  console.log((roomsLookUp[player.location].desc))
  //---------------- Main Story code: move, take, drop, status, inventory ----------
  while (true) {
    let room = roomsLookUp[player.location];
    let question = await ask('move, drink, take, drop, check inventory, read, status\nWhat do you want to do? ')
    if (question === 'move') {
      console.log(shipRooms[player.location].canChangeTo)
      let clarifyingQ = await ask('What room do you want to go to? ')
      if (clarifyingQ === 'engineBlock' && engineBlock.locked === true){
        await passcodeEngineBlock()
      }
      // if (clarifyingQ === 'hangarControlRoom'){
      //   console.log('lol')
      //   turnPowerOnInHangarControlRoom()       // this room wont unlock even if the fuse is in inventory... aslo make sure the officerQuarters will unlock with key in inventory 
        
      // }
      room.moveBetweenRooms(clarifyingQ)
      room = roomsLookUp[player.location]
      console.log(room.desc)
    }
    else if (question === 'take') {
      let takeQ = await ask('What would you like to take? ')
      if (room.inv.includes(takeQ)) {
        console.log('You have taken this item for your inventory.')
        player.inventory.push(takeQ)
      } else {
        console.log('That specific item is not found in this room. Look elsewhere. ')
      }
    }
    else if (question === 'drop') {
      let dropQ = await ask('What would you like to drop? ')
      if (player.inventory.includes(dropQ)) {
        console.log('You have dropped this item. ')
        player.inventory.pop[dropQ]
      } else {
        console.log('That specific item is not found in your inventory. ')
      }
    }
    else if (question === 'check inventory') {
      let inventoryQ = await ask('Would you like to check your inventory? ')
      if (inventoryQ === 'yes') {
        console.log('The items you have in your inventory are: ' + player.inventory)
      } else {
        console.log('OK ... moving on ')
      }
    }
    else if (question === 'status') {
      let statusQ = await ask('Would you like to check your status? ')
      if (statusQ === 'yes') {
        console.log('You are currently feeling: ' + player.status)
      } else {
        console.log('OK ... moving on ')
      }
    }
    else if (question === 'drink') {
      let drinkQ = await ask('Would you like to drink this? ')
      if (drinkQ === 'yes') {
        console.log(player.status)
        player['changeStatus']()
        console.log('You are currently feeling: ' + player.status)
      } else {
        console.log('OK ... moving on ')
      }
    }
    else if (question === 'read'){
      let readQ = await ask('What item in your inventory would you like to read? ')
      if (readQ === 'notepad'){
        console.log(notepad.desc)
      }
    }
  }
}         // need a victory condition else if as well 


//We have made it to here and have logic that allows you to move between room and take items, and player status -ish

//let powerOn = false           // we will worry about this later
// hangarFunc()

// async function hangarFunc() {
//   let hangarQ = await ask('You notice a light flickering and as you look around you notice the ship has lost power\n the ship is sinking closer to a black hole\nYou need to find this ships ECM to fix your ship before the black hole consumes you and the ship\nyou find a blueprint of the ship\nthe blueprint says the ship\'s spare parts are in the Engine Block\ndo you take the blueprint with you?\ntake or leave ')
//   if (hangarQ !== 'leave') {
//     console.log('Wow how rude other castaways might need the blueprint aswell')
//     // blueprint has posion so if you hold it for too long you die 
//     console.log('\ndes of how you die')
//     process.exit()
//   } else {
//     //edit this maybe
//     console.log('that was the right choice')
//   }
// }
//   let secHangarQ = await ask('\nyou look around and notice that there are three doors on the hangar\none to the east\none to the west\none to the south\nwhich door do you want to enter')
//   while (secHangarQ === 'east' || secHangarQ === 'west' || secHangarQ === 'south' || secHangarQ === 'north') {
//     if (secHangarQ === 'east') {
//       if (powerOn === true) {
//         console.log('This is the Hangar Control Room')
//         hangarControl()
//         break;
//       } else {
//         console.log('\nYou need to turn the power on to open this door')
//         secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
//       }
//     }         // Also need south "else if" also have "else" = death
//     else if (secHangarQ === 'west') {
//       let westCode = await ask('Passcode please ')
//       if (westCode !== '1223') {
//         console.log(('\nIncorrect Passcode'))
//         secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
//       } else {
//         console.log('Welcome to the Engine Block')
//         engineBlock()
//         break
//       }
//     }
//     else if (secHangarQ === 'south') {
//       console.log('Welcome to the Mess Hall')
//       messHall()
//       break
//     }
//     else if (secHangarQ === 'north') {
//       console.log('You have picked an invalid direction\nyou have been sucked out into space and died')
//       process.exit()
//     }
//   }
// }

// engineBlock()

// async function engineBlock() {
//   let engineBlockQ = await ask('howdy')
// }

// hangarControl()

// async function hangarControl() {
//   let hangarControlQ = await ask('howdy')
// }
// //---------Dis is the foyer--------------
// messHall()

// async function messHall() {
//   console.log('In the mess hall ')
//   let messHallQ = await ask('howdy')
// }



