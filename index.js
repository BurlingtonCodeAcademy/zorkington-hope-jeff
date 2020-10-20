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

  // Setting power to off
  changePower() {
    this.power = true
  }

  // Setting doors to locked
  changeLock() {
    this.locked = false
  }

  moveBetweenRooms(move) {
    moveToNewRoom(move)
  }
}

// Our Room definitions, we have six rooms total
const hangar = new Room('hangar', 'You are now in the Hangar.\n\nYou find yourself in a dimly-lit room. The air around you is cold and stale.\nThere is a workbench nearby with tool and anti-static equipment\nThere are three doors leading out.\n\n ', ['Blueprint'], false, true)
const engineBlock = new Room('Engine Block', 'You are now in the Engine Block.\n\nParts are laying everywhere... This place is a complete mess!\nYou need to locate the ECM, it\'s got to be in here!\n\n ', ['ECM'], true, true)
const hangarControlRoom = new Room('Hangar Control Room\n\n', 'You find yourself standing before the hangar control room door.\nDocuments and clothing are sprawled out all over the room. \nThere is a work desk with a single key on top of it.\n\n ', ['key'], true, false)
const officerQuarters = new Room('Officer Quarters', 'The key worked!!\n\nYou are now in the officer quarters.\n\nAround the room, you see bunked beds, chairs, and writing tables.\nOn the wall above a writing table is a bulletin board\nfull of schedules, duty rosters ...\nand a random notepad with something scrawled upon it.\nYou should probably "read" it...\n\n ', ['notepad'], true, true)
const messHall = new Room('Mess Hall', 'You are now in the mess hall.\n\nIt appears that the last meal listed on the menu board was Taco Surprise.\nYou are not feeling particularly hungry but thirst is gnawing at you...\nMaybe this opened crate of "energyDrink" is still good?\n\n ', ['energyDrink'], false, true)
const generatorRoom = new Room('Generator Room', 'You are now in the generator room.\n\nAs you move through the archway into this room, you notice various consoles full of buttons and gauges, shelves with parts bins stacked up, as well as a pile of spare parts, including a fuse, laid out upon a small workbench.\n\n ', ['fuse'], false, true)


//item class with descriptions
class Item {
  constructor(name, description, takeable) {
    this.name = name,
      this.desc = description,
      this.takeable = takeable
  }

}
//These are the new items defined, however many of these are not used currently

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

//--------------------------- movement to and from rooms -----------------------------

// This function moves our player around
async function moveToNewRoom(newRoom) {
  let changeRoom = shipRooms[player.location].canChangeTo;

  // This is logic to unlock the Hangar Control Room and restore power (which is achieved by the fuse being in our inventory)
  if (changeRoom.includes(newRoom)) {
    if (player.inventory.includes('fuse')) {
      hangarControlRoom['changePower']()
      hangarControlRoom['changeLock']()
    }
    // This is logic to unlock the OfficerQuarters (which is done so with the key   
    if (player.inventory.includes('key')) {
      officerQuarters['changeLock']()
    }
    // This is an automated message when a player attempts to enter a room that is currently locked otherwise they proceed through the door into "newRoom" 
    if (roomsLookUp[newRoom].locked) {
      console.log('\n****This room is locked.**** ')
    } else {
      player.location = newRoom
    }
    // This is our victory logic!
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

// This is our launch function - pun intended 
async function launch() {
  const welcomeMessage = `You don’t know how you survived your last encounter with space pirates.\nBut it seems luck was on your side\n...Well not entirely.\n\nYour ECM (electronic control module) was damaged in your last emergency jump drive\n\nWithout the ECM you’re unable to switch fuel types, making another quantum jump\nout of the Virgo system, back to Orion, your home system, impossible.\n\nAre you ready? `;
  let answer = await ask(welcomeMessage);

  // Are you ready to start the game logic
  if (answer !== 'yes') {
    console.log(`*static radio* Incoming message from space pirates, 'I have you now!'...\nYou\'re disintegrated into space particles `)
    process.exit()
  } else {
    console.log('\n\n!!!Alert: Your hydrogen fuel levels are critical. Immediate refueling required!!!');
  }
  // This is where our adventure really begins, the logic tells the user their overall objective
  let hydroResponse = await ask('\n\nWhat are you going to do?\n\nYou can check fuel by pulling the lever.\nDo you pull the lever\nyes or no? ')

  if (hydroResponse !== 'yes') {
    console.log('\n\nBy not pulling the lever your fuel runs out and you die...blissfully ignorant')
    process.exit()
  } else {
    console.log(`\nYou estimate roughly 4 hours of flight time left with your remaining hydrogen fuel\nYou will need to find a replacement ECM to make a Quantum jump or ...\nYou will be stuck floating in this system forever.\n\nBy stroke of pure luck your radar locates a much larger vessel relatively close by`)
  }
  // This is the logic asking if we'd like to land our ship and continue our adventure or prematurely end our journey
  let nextStep = await ask('\n\nShould you land on the ship?\nType "land" or "fly away"? ')
  if (nextStep !== 'land') {
    console.log('\n\nWell, your calculations were wrong about how much remaining fuel your ship had..\n\nYou have succumbed to the vast, cold emptiness of space.')
    process.exit()
  } else {
    console.log('\nYou touch down on the ship\'s landing pad successfully!')
  }
  //just some more details for the player about their impending doom
  console.log('\n\nYou notice a light flickering above the dimly lit hangar, and as you continue your initial observations, it becomes quite apparent that the ship has lost power!\n\n!!!The ship is sinking closer to a black hole!!!\n\nYou must act quickly and search this cruiser to find the ECM your ship needs\nbefore the black hole consumes you and the cruiser!!!\n\n\nYou can change rooms by typing "move"\nYou can take an item for your inventory by typing "take".\nYou can drop an item by typing "drop".\nTo check your inventory type "check inventory"\nTo check your status type "status".\nTo read an item type "read"\n\n***DISCLAIMER*** This rollercoaster doesn\'t have any seat-belts...\n Please type user inputs exactly as they are listed or\n you might prematurely end your adventure!')

  //this is the part of the story where our player can interact with a blueprint but can't take it as per the story's request
  let blueprintQ = await ask('\nYou find a blueprint of the ship.\nThe blueprint says the ship\'s spare parts are in the Engine Block.\ndo you take or leave. ')
  if (blueprintQ === 'leave') {
    console.log('\n***You place the blueprint back down***')
  } else {
    // Hope loves killing our user if they aren't reading carefully :)
    console.log('\nOh no, the poison left on the blueprint spreads throughout your body\nyou have now died\nINCONCEIVABLE! ')
    process.exit()
  }


  console.log((roomsLookUp[player.location].desc))
  //---------------- Main Story code: move, take, drop, status, inventory ----------

  // This loop is for our player actions, 
  while (true) {
    let room = roomsLookUp[player.location];
    let question = await ask('move, drink, take, drop, check inventory, read, status\nWhat do you want to do? ')

    // This action is 'movement' in between rooms 
    if (question === 'move') {
      console.log(shipRooms[player.location].canChangeTo)
      let clarifyingQ = await ask('\nWhat room do you want to go to? ')

      // If you hit the EngineBlock you are invoking the passcode engineBlock function 
      if (clarifyingQ === 'engineBlock' && engineBlock.locked === true) {
        await passcodeEngineBlock()
      }
      // if you hit the hangarControlRoom you are invoking the turnPowerOnInHangarControlRoom function
      if (clarifyingQ === 'hangarControlRoom') {
        turnPowerOnInHangarControlRoom()
      }
      // This is our code for alerting the player of their current location and the room's description
      room.moveBetweenRooms(clarifyingQ)
      room = roomsLookUp[player.location]
      console.log(room.desc)
    }
    // This is the 'take' action and it's respective 'await / ask' 
    else if (question === 'take') {
      let takeQ = await ask('\nWhat would you like to take? ')

      // If you successfully attempted to take an item, this is the next respective logic
      if (room.inv.includes(takeQ)) {
        console.log('\nYou have taken this item for your inventory.')
        room.inv.pop(takeQ)
        player.inventory.push(takeQ)
        
      } else {
        console.log('That specific item is not found in this room. Look elsewhere. ')
      }
    }

    // this is the 'drop' action for dropping player items
    else if (question === 'drop') {
      let dropQ = await ask('\nWhat would you like to drop? ')

      // If you successfully attempted to drop an item, this is the next respective logic 
      if (player.inventory.includes(dropQ)) {
        console.log('\n\nYou have dropped this item. ')
        player.inventory.pop[dropQ];
// This is where we left off ------------------------------------------------------
        room.inv.push[dropQ]

      } else {
        console.log('\nThat specific item is not found in your inventory. ')
      }
    }
    // This is the 'check inventory' action and it's assigned 'await / ask' 
    else if (question === 'check inventory') {
      let inventoryQ = await ask('\nWould you like to check your inventory? ')

      // If you successfully attempted to 'check inventory', this is the next respective logic 
      if (inventoryQ === 'yes') {
        console.log('The items you have in your inventory are: ' + player.inventory)
      } else {
        console.log('\n\nOK ... moving on ')
      }
    }
    // This is the 'status' action and it's assigned 'await / ask' 
    else if (question === 'status') {
      let statusQ = await ask('\nWould you like to check your status? ')

      // If you successfully attempted to 'check status', this is the next respective logic 
      if (statusQ === 'yes') {
        console.log('You are currently feeling: ' + player.status)
      } else {
        console.log('\n\nOK ... moving on ')
      }
    }

    // This is the 'drink' action and it's assigned 'await / ask' 
    else if (question === 'drink') {
      let drinkQ = await ask('\nWould you like to drink this? ')
    // If you successfully attempted to 'drink', this is the next respective logic 
      if (drinkQ === 'yes' && player.inventory.includes['energyDrink']) {
        console.log(player.status)
        player['changeStatus']()
        console.log('\n\nYou are currently feeling: ' + player.status)
      } else {
        console.log('\n\nYou don\'t have anything to drink ')
      }
    }
    // This is the 'read' action and it's assigned 'await / ask' 
    else if (question === 'read') {
      let readQ = await ask('\nWhat item in your inventory would you like to read? ')
      // If you successfully attempted to 'read', this is the next respective logic 
      if (readQ === 'notepad') {
        console.log(notepad.desc)
      }
    }
  }
}         
