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
  changePower() {
    this.power = true
  }
  changeLock() {
    this.locked = false
  }

  moveBetweenRooms(move) {
    moveToNewRoom(move)
  }
}
const hangar = new Room('hangar', 'You are now in the Hangar.\n\nYou find yourself in a dimly-lit room. The air around you is cold and stale.\nThere is a workbench nearby with tool and anti-static equipment\nThere are three doors leading out.\n\n ', ['Blueprint'], false, true)
const engineBlock = new Room('Engine Block', 'You are now in the Engine Block.\n\nParts are laying everywhere... This place is a complete mess!\nYou need to locate the ECM, it\'s got to be in here!\n\n ', ['ECM'], true, true)
const hangarControlRoom = new Room('Hangar Control Room\n\n', 'You find yourself standing before the hangar control room door.\nDocuments and clothing are sprawled out all over the room. \nThere is a workdesk with a single key on top of it.\n\n ', ['key'], true, false)
const officerQuarters = new Room('Officer Quarters', 'The key worked!!\n\nYou are now in the officer quarters.\n\nAround the room, you see bunked beds, chairs, and writing tables.\nOn the wall above a writing table is a bulletin board\nfull of schedules, duty rosters ...\nand a random notepad with something scrawled upon it.\nYou should probably "read" it...\n\n ', ['notepad'], true, true)
const messHall = new Room('Mess Hall', 'You are now in the mess hall.\n\nIt appears that the last meal listed on the menu board was Taco Suprise.\nYou are not feeling particularly hungry but thirst is gnawing at you...\nMaybe this opened crate of "energyDrink" is still good?\n\n ', ['energyDrink'], false, true)
const generatorRoom = new Room('Generator Room', 'You are now in the generator room.\n\nAs you move through the archway into this room, you notice various consoles full of buttons and gauges, shelves with parts bins stacked up, as well as a pile of spare parts, including a fuse, laid out upon a small workbench.\n\n ', ['fuse'], false, true)

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
const notepad = new Item('notepad', '\n"Boss keeps telling me I\'m a "liability" to security...\n So I should probably remember this passcode: 1223.\n I\'ll show the bossman this time."\n\n', true)
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
    if (player.inventory.includes('fuse')) {
      hangarControlRoom['changePower']()
      hangarControlRoom['changeLock']()
    }
    if (player.inventory.includes('key')) {
      officerQuarters['changeLock']()
    }
    if (roomsLookUp[newRoom].locked) {
      console.log('\n****This room is locked.**** ')
    } else {
      player.location = newRoom
    }
    if (player.inventory.includes('ECM') && player.location === 'hangar') {
      console.log(`You rush back to your spacecraft in the hangar and immediately begin installation of your new ECM. With not a moment to spare you fix your drive, take off from the hangar, and begin your Quantum jump back home! \n\n!!!VICTORY!!!\n\nNow you're expected back at work on Monday...so "victory" is a subjective word `)
      process.exit()
    }
  } else {
    console.log('\nYou cant go that way! ')
  }
}

//-----------------------------unlocking the engine block room--------------------------------
async function passcodeEngineBlock() {
  let passcodeQ = await ask('What is the Passcode ')
  if (passcodeQ === '1223') {
    engineBlock.locked = false
    console.log('\n!!Access Granted!! ')
  } else {
    console.log('\n**Incorrect passcode** ')
  }
}
//-----------------------------Turning on Power--------------------------------
async function turnPowerOnInHangarControlRoom() {
  if (hangarControlRoom.power === true) {
    console.log('\n!!Access Granted!! ')
  } else {
    console.log('\nThe door\'s control panel seems fried; however, it seems like an easy fix... You\'ll just need to replace the fuse.')
  }

}
// --------------------------- The game story code is below this line ---------------------------
launch();

async function launch() {
  const welcomeMessage = `You don’t know how you survived your last encounter with space pirates.\nBut it seems luck was on your side\n...Well not entirely.\n\nYour ECM (electronic control module) was damaged in your last emergency jump drive\n\nWithout the ECM you’re unable to switch fuel types, making another quantum jump\nout of the Virgo system, back to Orion, your home system, impossible.\n\nAre you ready? `;
  let answer = await ask(welcomeMessage);
  if (answer !== 'yes') {
    console.log(`*static radio* Incoming message from space pirates, 'I have you now!'...\nYou\'re disintegrated into space particles `)
    process.exit()
  } else {
    console.log('\n\n!!!Alert: Your hydrogen fuel levels are critical. Immediate refueling required!!!');
  }
  let hydroResponse = await ask('\n\nWhat are you going to do?\n\nYou can check fuel by pulling the lever.\nDo you pull the lever\nyes or no? ')

  if (hydroResponse !== 'yes') {
    console.log('\n\nBy not pulling the lever your fuel runs out and you die...blissfully ignorant')
    process.exit()
  } else {
    console.log(`\nYou estimate roughly 4 hours of flight time left with your remaining hydrogen fuel\nYou will need to find a replacement ECM to make a Quantum jump or ...\nYou will be stuck floating in this system forever.\n\nBy stroke of pure luck your radar locates a much larger vessel relatively close by`)
  }
  let nextStep = await ask('\n\nShould you land on the ship?\nType "land" or "fly away"? ')
  if (nextStep !== 'land') {
    console.log('\n\nWell, your calculations were wrong about how much remaining fuel your ship had..\n\nYou have succumbed to the vast, cold emptiness of space.')
    process.exit()
  } else {
    console.log('\nYou touch down on the ship\'s landing pad successfully!')
  }
  console.log('\n\nYou notice a light flickering above the dimly lit hangar, and as you continue your initial obeservations, it becomes quite apparent that the ship has lost power!\n\n!!!The ship is sinking closer to a black hole!!!\n\nYou must act quickly and search this cruiser to find the ECM your ship needs\nbefore the black hole consumes you and the cruiser!!!\n\n\nYou can change rooms by typing "move"\nYou can take an item for your inventory by typing "take".\nYou can drop an item by typing "drop".\nTo check your inventory type "check inventory"\nTo check your status type "status".\nTo read an item type "read"\n\n***DISCLAIMER*** This rollercoaster doesn\'t have any seatbelts...\n Please type user inputs exactly as they are listed or\n you might prematurely end your adventure!')

  let blueprintQ = await ask('\nYou find a blueprint of the ship.\nThe blueprint says the ship\'s spare parts are in the Engine Block.\ndo you take or leave. ')
  if (blueprintQ === 'leave') {
    console.log('\n***You place the blueprint back down***')
  } else {
    console.log('\nOh no, the poison left on the blueprint spreads throughout your body\nyou have now died\nINCONCEIVABLE! ')
    process.exit()
  }


  console.log((roomsLookUp[player.location].desc))
  //---------------- Main Story code: move, take, drop, status, inventory ----------
  while (true) {
    let room = roomsLookUp[player.location];
    let question = await ask('move, drink, take, drop, check inventory, read, status\nWhat do you want to do? ')
    if (question === 'move') {
      console.log(shipRooms[player.location].canChangeTo)
      let clarifyingQ = await ask('\nWhat room do you want to go to? ')
      if (clarifyingQ === 'engineBlock' && engineBlock.locked === true) {
        await passcodeEngineBlock()
      }
      if (clarifyingQ === 'hangarControlRoom') {
        turnPowerOnInHangarControlRoom()       // this room wont unlock even if the fuse is in inventory... aslo make sure the officerQuarters will unlock with key in inventory 

      }
      room.moveBetweenRooms(clarifyingQ)
      room = roomsLookUp[player.location]
      console.log(room.desc)
    }
    else if (question === 'take') {
      let takeQ = await ask('\nWhat would you like to take? ')
      if (room.inv.includes(takeQ)) {
        console.log('\nYou have taken this item for your inventory.')
        player.inventory.push(takeQ)
      } else {
        console.log('That specific item is not found in this room. Look elsewhere. ')
      }
    }
    else if (question === 'drop') {
      let dropQ = await ask('\nWhat would you like to drop? ')
      if (player.inventory.includes(dropQ)) {
        console.log('\n\nYou have dropped this item. ')
        player.inventory.pop[dropQ]
      } else {
        console.log('\nThat specific item is not found in your inventory. ')
      }
    }
    else if (question === 'check inventory') {
      let inventoryQ = await ask('\nWould you like to check your inventory? ')
      if (inventoryQ === 'yes') {
        console.log('The items you have in your inventory are: ' + player.inventory)
      } else {
        console.log('\n\nOK ... moving on ')
      }
    }
    else if (question === 'status') {
      let statusQ = await ask('\nWould you like to check your status? ')
      if (statusQ === 'yes') {
        console.log('You are currently feeling: ' + player.status)
      } else {
        console.log('\n\nOK ... moving on ')
      }
    }
    else if (question === 'drink') {
      let drinkQ = await ask('\nWould you like to drink this? ')
      if (drinkQ === 'yes' && player.inventory.includes['energyDrink']) {
        console.log(player.status)
        player['changeStatus']()
        console.log('\n\nYou are currently feeling: ' + player.status)
      } else {
        console.log('\n\nYou don\'t have anything to drink ')
      }
    }
    else if (question === 'read') {
      let readQ = await ask('\nWhat item in your inventory would you like to read? ')
      if (readQ === 'notepad') {
        console.log(notepad.desc)
      }
    }
  }
}         
