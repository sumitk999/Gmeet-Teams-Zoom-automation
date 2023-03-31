const { Browser, newPage, executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const { existsSync } = require("fs");
const socketIo = require("socket.io");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { text, json } = require("express");
const _ = require("lodash");
puppeteer.use(StealthPlugin());
let chats = [];
let participents = [];

var usersJoined = [];
var usersLeft = [];
exports.newBrowser = async () => {
  const puppeteerOptions = {
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      // '--use-fake-ui-for-media-stream',
      // '--use-fake-device-for-media-stream',
      // '--use-file-for-fake-audio-capture=/home/mj/experiment/meet-the-bots/example.wav',
      // '--allow-file-access',
      // '--lang=en',
      // '--no-sandbox',
      "--auto-select-tab-capture-source-by-title=Meet",
      // "--auto-select-desktop-capture-source=Entire screen",
      "--start-maximized",
    ],
    env: {
      LANG: "en",
    },

    // executablePath: executablePath(),

    executablePath: "C:/Program Files/Google/Chrome/Application/Chrome.exe",
  };

  if (existsSync("/usr/bin/chromium-browser")) {
    console.log("Altering puppeteer chromium path...");
    puppeteerOptions.executablePath = "/usr/bin/chromium-browser";
  }
  const browser = await puppeteer.launch(puppeteerOptions);
  browser
    .defaultBrowserContext()
    .overridePermissions("https://meet.google.com/", [
      "microphone",
      "camera",
      "notifications",
    ]);

  browser
    .defaultBrowserContext()
    .overridePermissions("https://dev-light-app.antino.ca/11/22/gmeet/", [
      "microphone",
      "camera",
      "notifications",
    ]);
  const page = await browser.newPage();
  // setTimeout()
  // await newPage.setViewport({ width: 1500, height: 768});

  //   await page.goto('http://127.0.0.1:5500/index.html');
  // await page.goto('https://dev-light-app.antino.ca/11/22/gmeet/123/Sumit');
  //   await page.waitForTimeout(3000)
  let newPage;
  // newPage = await browser.newPage();
  async function runMeet() {
    newPage = await browser.newPage();
    await newPage.goto("https://meet.google.com/ecv-hkyh-uce");
    //   await newPage.keyboard.type('LigthBulb', { delay: 15 });
    // console.log('turn off cam using Ctrl+E');
    await newPage.waitForTimeout(1110);
    await newPage.keyboard.down("ControlLeft");
    await newPage.keyboard.press("KeyE");
    await newPage.keyboard.up("ControlLeft");
    // await newPage.waitForTimeout(100);

    // console.log('turn off mic using Ctrl+D');
    await newPage.waitForTimeout(100);
    await newPage.keyboard.down("ControlLeft");
    await newPage.keyboard.press("KeyD");
    await newPage.keyboard.up("ControlLeft");
    await newPage.waitForTimeout(2000);
    // await newPage.waitForSelector("#c5")
    // await newPage.type("#c5", "LigthBulb", { delay: 15 })
    await newPage.keyboard.type("LigthBulb", { delay: 15 });

    await clickText(newPage, "Ask to join");
  }
  await runMeet();

  // You can't join this video call
  let count = Date.now() + 1200000;
  const inter = setInterval(async () => {
    //VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ JsuyRc boDUxc
    // const abc = await newPage.waitForSelector('button[jsname=A5il2e]')
    // abc.click()
    const notJoinCall = (await newPage.content()).match(
      "You can't join this video call"
    );
    if (notJoinCall != null) {
      await newPage.close();
      await runMeet();
    }

    const element = await newPage.$(".uGOf1d");
    if (element != null) {
      clearInterval(inter);
      await clickText(newPage, "people_outline");
      await newPage.waitForTimeout(500);
      await clickText(newPage, "close");
      await newPage.waitForTimeout(500);
      // await clickText(newPage, "close");
      // await newPage.keyboard.down("ControlLeft");
      // await newPage.keyboard.down("altKey");
      // await newPage.keyboard.press("KeyP");
      // await newPage.keyboard.up("altKey");
      // await newPage.keyboard.up("ControlLeft");
      const users = await newPage.$$(".zWGUib");
      // const texts = await newPage.evaluate(users => users.textContent, users);
      // console.log("users ====  ", users);
      // users.map(async (ele) => {
      // 	const texts = await newPage.evaluate(ele => ele.textContent, ele);
      // 	console.log("User Name => ", texts);
      // })
      console.log("User Admitted !!!", element);
      // await monitorChat(newPage)
      await test(element, users);
    } else {
      const time = Date.now();
      console.log((count - time) / 1000);

      const botDenied = (await newPage.content()).match(
        "You can't join this call"
      );

      if (botDenied != null) {
        clearInterval(inter);
        console.log("Bot has denied!!!!");
        await newPage.close();
      }
      if (count <= time) {
        clearInterval(inter);
        console.log("Timeout");
        // await newPage.close()
        console.log("User not admitted ==> Browser closed");
        // await browser.close()
      }
      console.log("User not Joined.........");
    }
  }, 2000);

  async function test(element, users) {
    let text;
    await clickText(newPage, "chat");
    await newPage.waitForTimeout(1100);
    await clickText(newPage, "chat_bubble");
    // var usersJoined = [];
    // var usersLeft = [];
    //Joined user Function
    const userJoinedAction = (arr) => {
      console.log("User Joined");
      arr.map((user) => {
        let obj = { event: "userJoin", userName: user, joinTime: new Date() };
        usersJoined.push(obj);
      });
      console.log("Final Users Joined Array", usersJoined);
    };
    //Left user Function
    const userLeftAction = (arr) => {
      console.log("User Left");
      arr.map((user) => {
        let obj = { event: "userLeft", userName: user, leaveTime: new Date() };
        usersLeft.push(obj);
      });
      console.log("Final users left Array", usersLeft);
    };
    let tempList = [];
    let speakEvent = {}
    let spkEve = []
    const clrInt = setInterval(async () => {
      try {
        await monitorChat(newPage);
        // await GetUserList(listEl);
        // console.log("Before evaluate function");
        // let listEl = await newPage.evaluate(() => {
        //   let speakerList = []
        //   const list = Array.from(document.querySelectorAll('[role="list"]'))
        //   for (let i = 1; i < list[0]?.childNodes?.length; i++) {
        //     const userObj = {}
        //     let micEvent = list[0]?.childNodes[i]?.childNodes[1]?.childNodes[0]?.innerText
        //     let username = list[0]?.childNodes[i]?.childNodes[0]?.childNodes[1]?.outerText
        //     if (micEvent.includes("You can't unmute someone else")) {
        //       userObj['name'] = username
        //       userObj['speaking'] = false
              
        //     } else {
        //       userObj['name'] = username
        //       userObj['speaking'] = true
              
        //     }
        //     speakerList.push(userObj)
        //   }

        //   return speakerList;
        // });
        // console.log("Speaker Event : ", spkEve);
        // listEl.map((e) => {
        //   let obj = {}
        //   if (!spkEve.length && e.speaking) {
        //     // if(!spkEve[spkEve.length-1]['speaking']){

        //       obj['name'] = e.name
        //       obj['time'] = new Date()
        //       obj['speaking'] = true
        //       spkEve.push(obj)
        //       console.log("if block");
        //     // }
        //   } else if (e.speaking) {
        //     if(spkEve[spkEve.length-1]['name'] != e.name && spkEve[spkEve.length-1]['speaking'] == e.speaking){

        //       obj['name'] = e.name
        //       obj['time'] = new Date()
        //       obj['speaking'] = true
        //       spkEve.push(obj)
        //     }
        //     if(spkEve[spkEve.length-1]['name'] == e.name  && spkEve[spkEve.length-1]['speaking'] != e.speaking){
        //       obj['name'] = e.name
        //       obj['time'] = new Date()
        //       obj['speaking'] = true
        //       spkEve.push(obj)
        //     }
        //     console.log("else if block 1");
        //   }else if(spkEve.length && !e.speaking && spkEve[spkEve.length-1]['speaking']){
        //     if(e.name == spkEve[spkEve.length-1]['name']){

        //       spkEve[spkEve.length-1]['speaking'] = false
        //       console.log("else if block 2");
        //     }
        //   }
        // })
       
        text = await newPage.evaluate(
          (element) => element.textContent,
          element
        );
        // const user = await newPage.evaluate(users => users.textContent, users);
        // const userNames = await newPage.$$('.zWGUib')
        const userList = await newPage.evaluate(() => {
          const list = Array.from(document.querySelectorAll(".zWGUib")).map(
            (elm) => elm.innerText
          );
          return list;
        });
        if (userList.length > tempList.length) {
          var dif = _.differenceWith(userList, tempList, _.isEqual);
          //   //New Addition
          //   console.log("User Joined", dif, " at ", new Date());
          if (dif.length != 0) {
            userJoinedAction(dif);
          }
        }
        if (tempList.length > userList.length) {
          var difleft = _.differenceWith(tempList, userList, _.isEqual);
          //New Addition
          //   console.log("User Left", difleft, " at ", new Date());
          if (difleft.length != 0) {
            userLeftAction(difleft);
          }
        }
        //Updating list to temp
        tempList = userList;
        // await storeParticipents(userNames,newPage)
        // let userArr = []
        // userNames.map(async (ele) => {
        // 	const user = await newPage.evaluate(ele => ele.textContent, ele);
        // 	// console.log("User Name => ", texts);
        // 	userArr.push(user)
        // 	console.log("user Arr ",userArr);

        // 	if(!participents.length){
        // 		const data = {
        // 			userName:user,
        // 			joinTime:Date.now()
        // 		}
        // 		participents.push(data)
        // 	}
        // 	else{
        // 		const status = await storeParticipents(user)
        // 		if(!status){
        // 			const data = {
        // 				userName:user,
        // 				joinTime:Date.now()
        // 			}
        // 			console.log("user  ",data);
        // 			participents.push(data)
        // 		}
        // 	}
        // })

        const botRemoved = (await newPage.content()).match(
          "You've been removed from the meeting"
        );
        // console.log('botRemoved  ====>>>>>>>  ', botRemoved);
        if (botRemoved != null) {
          clearInterval(clrInt);
          console.log("Bot has kicked !!!!!!");
          console.log("Speak : ", spkEve);
          userslogs();
          //   console.log(">>>>>>>>>>", participents);
          // participents.map((e) => console.log("username => ", e))
          chats.map((e) => console.log(e));
        }
        if (text == 1 || text == "undefined") {
          clearInterval(clrInt);
          userslogs();
          // newPage.close()
          // const chatItems = await page.$$('div.GDhqjd');
          participents.map((e) => console.log("username => ", e));
          console.log("Meeting Ended !!!");
          chats.map((e) => console.log(e));
          console.log("Browser closed");
          // browser.close()
        }
      } catch (error) {
        console.log("error --> ", error);
        clearInterval(clrInt);
        // newPage.close()
        console.log("Browser closed");
        // browser.close()
      }
    }, 2000);
  }
};

const userslogs = () => {
  console.log("Sending User Logs");
  let payloadJoin = {
    key: "attendeesJoin",
    meetingCode: "34343",
    userDetails: usersJoined,
  };
  //Joij time API
  let payloadleave = {
    key: "attendeesLeave",
    meetingCode: "34343",
    userDetails: usersLeft,
  };
  //Leave time API
  console.log("Join Payload", payloadJoin);
  console.log("Leave Payload", payloadleave);
};
const clickText = async (newPage, text, retries = 3) => {
  const elems = await newPage.$x(`//*[contains(text(),'${text}')]`);
  let clicked = false;
  for (const el of elems) {
    try {
      await el.click();
      clicked = true;
    } catch {
      // sometimes elements with the same text are found which are not clickable
    }
  }
  if ((elems.length === 0 || !clicked) && retries > 0) {
    await newPage.waitForTimeout(300);
    await clickText(newPage, text, retries - 1);
  }
};

const monitorChat = async (page) => {
  const chatItems = await page.$$("div.GDhqjd");
  const events = [];
  await Promise.all(
    chatItems.map(async (chatDiv) => {
      const chatTextItems = await chatDiv.$$(".oIy2qc");
      const texts = await Promise.all(
        chatTextItems.map((textDiv) =>
          textDiv.evaluate((node) => node.textContent)
        )
      );
      const timestamp = await chatDiv.evaluate((node) =>
        node.getAttribute("data-timestamp")
      );
      const sender = await chatDiv.evaluate((node) =>
        node.getAttribute("data-sender-name") === "You"
          ? "LB Bot"
          : node.getAttribute("data-sender-name")
      );
      const messageGroup = {
        timestamp: timestamp,
        sender: sender,
        messages: texts,
      };
      const newMessages = updateGroup(messageGroup);
      newMessages.forEach((m) => events.push({ timestamp, sender, text: m }));
      // events.push(messageGroup)
    })
  );
  // console.log("All Chats -->> ",events.length);
  for (const event of events) {
    console.log(event);
    chats.push(event);
  }
  // monitorChat(page)
  // bot.addJob(monitorChat); // bot removes the job after running it, so re-add it
};

var messages = new Map();
function updateGroup(newGroup) {
  const groupId = newGroup.timestamp + newGroup.sender;
  const existingGroup = messages.get(groupId);
  messages.set(groupId, newGroup);
  if (existingGroup) {
    return newGroup.messages.slice(existingGroup.messages.length);
  }
  return newGroup.messages;
}

async function storeParticipents(username) {
  let flage = false;
  participents.map((e) => {
    if (e["userName"] == username) {
      flage = true;
      return flage;
    }
  });
  return flage;
}

async function userLeft(userArr) {
  for (let i = 0; i < userArr.length; i++) {
    for (j = 0; j < participents.length; j++) {
      if (participents[j].userName != userArr[i]) {
        participents[i]["leftTime"] = Date.now();
      }
    }
  }
}
let users = [];
// let listEl = document.querySelectorAll('[role="list"]');

async function GetUserList(listEl) {
  // let users = [];

  //   const listEl = await page.evaluate(() => {
  //     return document.querySelectorAll('[role="list"]');
  //  });
  // let listEl;
  // await newpage.evaluate(async () => {
  //   listEl = await document.querySelectorAll('[role="list"]');
  // });
  // const listEl =await abc(newpage)
  // console.log("elList type ");

  // let listEl = document.querySelectorAll('[role="list"]');
  if (listEl.length > 0) {
    console.log("ListElLength:", listEl.length);
    let listChildEl = listEl[0].childNodes;
    if (listChildEl.length > 0) {
      for (let i = 1; i < listChildEl.length; i++) {
        const userEl = listChildEl[i];
        console.log("userEl", userEl);

        let name = userEl.childNodes[0].childNodes[1].childNodes[0].textContent;
        console.log("Name::", name);

        let meetingHost =
          userEl.childNodes[0].childNodes[1].childNodes[1].textContent;
        console.log("MeetingHost:", meetingHost);

        let hostStatus = false;
        if (meetingHost.includes("host")) {
          // console.log("You Are Host");
          hostStatus = true;
        }
        // else {
        //     console.log("You are not host");
        // }

        let userObj = {
          name: name,
          isHost: hostStatus,
          talking: false,
          timestamp: new Date().getTime(),
          micStatus: false,
          classes: "",
        };

        // Mic Access from Participents List
        let micEl = null;
        if (hostStatus) {
          micEl = userEl.childNodes[1].childNodes[0].childNodes[0];
          let micClasses = micEl.childNodes[0].classList.value;
          console.log("MicClassess::", micClasses);
          let mainText =
            listEl[0].childNodes[i].childNodes[1].childNodes[0].childNodes[0]
              .childNodes[1].innerText;
          console.log(`Main text for User ${name} : `, mainText);
          if (mainText == "You can't unmute someone else") {
            console.log(`USer -> ${name} : `, "Muted");
          } else {
            console.log(`USer -> ${name} : `, "Speaking");
            userObj.talking = true;
          }
        } else {
          micEl = userEl.childNodes[1].childNodes[0].childNodes[0];
          let micClasses = micEl.childNodes[0].classList.value;
          console.log("MicClassess::", micClasses);
          //Participants Mic
          //   let participantMicSpan = micEl.childNodes[0].childNodes[0];
          const ID =
            listEl[0].childNodes[i].childNodes[1].childNodes[0].childNodes[0]
              .childNodes[1].id;
          console.log("ID ", ID);
          let mainText =
            listEl[0].childNodes[i].childNodes[1].childNodes[0].childNodes[0]
              .childNodes[1].innerText;
          console.log(`Main text for User ${name} : `, mainText);
          if (mainText == "You can't unmute someone else") {
            console.log(`USer -> ${name} : `, "Muted");
          } else {
            console.log(`USer -> ${name} : `, "Speaking");
            userObj.talking = true;
          }

          if (micEl.childNodes.length > 0) {
            console.log("ElementType::", micEl.childNodes[0].localName);

            //Mic is off
            if (micEl.childNodes[0].localName === "div") {
              userObj["micStatus"] = false;
            }

            // Mic is on
            if (micEl.childNodes[0].localName === "button") {
              userObj["micStatus"] = true;
              console.log(
                "MicInnerElement::",
                micEl.childNodes[0].childNodes[2].childNodes[0].childNodes[0]
              );
              console.log(
                "MicInnerElementClassess::",
                micEl.childNodes[0].childNodes[2].childNodes[0].childNodes[0]
                  .classList.value
              );

              //Check for user is talking or not
              let currentClasses =
                micEl.childNodes[0].childNodes[2].childNodes[0].childNodes[0]
                  .classList.value;
              let ind = users.findIndex((item) => item.name == userObj.name);
              // console.log("ClassMatched::", ind, currentClasses, users[ind].classes)
              if (ind > -1) {
                // console.log("Classes::", currentClassess, users[ind].classess);
                // userObj = users[ind];
                console.log(
                  "ClassMatchedCondition::",
                  ind,
                  currentClasses,
                  users[ind].classes,
                  currentClasses != users[ind].classes
                );
                if (currentClasses != users[ind].classes) {
                  // existing user with talking
                  userObj.classes = currentClasses;
                  userObj.talking = true;
                  console.log("ClassChanged::", currentClasses, userObj);
                } else {
                }
              } else {
                // new user with mic on
                userObj.classes = currentClasses;
                // userObj.talking = false;
                console.log("ClassNotChanged::", currentClasses, userObj);
              }
            }
          }
        }
        // console.log("MicEl::", micEl.childNodes);

        // Add user to list
        if (users.length > 0) {
          let ind = users.findIndex((item) => {
            // console.log("Names::::", item.name, userObj.name)
            return item.name === userObj.name;
          });
          // console.log('FoundUserAt:::', ind, userObj.name);
          if (ind == -1) {
            users.push(userObj);
          } else {
            users[ind] = userObj;
          }
        } else {
          users.push(userObj);
        }
        // console.log('TestUser::', users);
      }
    }
  }

  console.log("Users:", JSON.stringify(users, null, 4));
  return users;
}


