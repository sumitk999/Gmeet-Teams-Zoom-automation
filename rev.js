let users = [];
let listEl = document.querySelectorAll('[role="list"]');
// console.log("ListEl", listEl); function GetUserList() {
  if (listEl.length > 0) {
    console.log("ListElLength:", listEl.length);
    let listChildEl = listEl[0].childNodes;
    if (listChildEl.length > 0) {
      for (let i = 1; i < listChildEl.length; i++) {
        const userEl = listChildEl[i];
        console.log("userEl", userEl);         let name = userEl.childNodes[0].childNodes[1].childNodes[0].textContent;
        console.log("Name::", name);         let meetingHost =
          userEl.childNodes[0].childNodes[1].childNodes[1].textContent;
        console.log("MeetingHost:", meetingHost);         let hostStatus = false;
        if (meetingHost.includes("host")) {
          // console.log("You Are Host");
          hostStatus = true;
        }
        // else {
        //     console.log("You are not host");
        // }     
    let userObj = {
          name: name,
          isHost: hostStatus,
          talking: false,
          timestamp: new Date().getTime(),
          micStatus: false,
          classes: "",
        };         // Mic Access from Participents List
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
          //   let participantMicSpan = micEl.childNodes[0].childNodes[0];
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
          }           if (micEl.childNodes.length > 0) {
            console.log("ElementType::", micEl.childNodes[0].localName);             //Mic is off
            if (micEl.childNodes[0].localName === "div") {
              userObj["micStatus"] = false;
            }             // Mic is on
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
              );               //Check for user is talking or not
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
                userObj.talking = false;
                console.log("ClassNotChanged::", currentClasses, userObj);
              }
            }
          }
        }
        // console.log("MicEl::", micEl.childNodes);         // Add user to list
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
  }   console.log("Users:", JSON.stringify(users, null, 4));
  return users;
} let count = 0;
// let inter = setInterval(() => {
//     if (count < 50) {
GetUserList();
//         count++;
//     }
//     else
//         clearInterval();
// }, 3000); // Mic Access from Gallary List
/*
let gallaryEl = document.querySelectorAll('[data-requested-participant-id]');
if(gallaryEl.length > 0){
    for (let i = 0; i < gallaryEl.length; i++) {
        const micEl = gallaryEl[i].childNodes[3];
        console.log("MicEl::", micEl);
    }
}*/