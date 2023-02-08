const { RevAiApiClient, RevAiApiDeployment, RevAiApiDeploymentConfigMap } = require('revai-node-sdk');
const fs = require('fs')

var accessToken = '0251WCMKTRa7O3yynRYqmXvGG6lKesQhWMuRyoEfKOyskvB3Qrz5OHpH8bm_dvjUdB9n6t4fbEC0sM2RuY4cvPOpPTS6Q';
var filePath = 'fff.mp4';

// initialize the client with your access token
var client = new RevAiApiClient({ token: accessToken, deploymentConfig: RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US) })
async function test() {
    const accountInfo = await client.getAccount();
    // const job = await client.submitJobLocalFile("./fff.mp4");
    const job = await client.submitJobLocalFile("./fff.mp4", {
        transcriber: "human",
        verbatim: false,
        rush: false,
        test_mode: true,
        segments_to_transcribe: [{
            start: 0.0,
            end: 2.4
        }],
        speaker_names: [{
            display_name: "Augusta Ada Lovelace"
        },{
            display_name: "Alan Mathison Turing"
        }]
    });
// var transcriptText = await client.getTranscriptText(job.id);

// // or as an object
// var transcriptObject = await client.getTranscriptObject(job.id);

console.log("Job ====> ",job);
// console.log('Text ====> ',transcriptText);
// console.log("Object ==>  ",transcriptObject);
}
test()
async function test1() {
    var transcriptObject = await client.getTranscriptObject('KHhOdHRDyNJA6gEW');
    console.log("Object ==>  ",transcriptObject);
    var transcriptText = await client.getTranscriptText('KHhOdHRDyNJA6gEW');
    console.log('Text ====> ',transcriptText);
}
// submit as audio data, the filename is optional
// test1()
// retrieve transcript
// as plain text
