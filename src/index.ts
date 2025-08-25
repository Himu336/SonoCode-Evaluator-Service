import express from "express";
import bodyParser from "body-parser";

// import SampleWorker from "./workers/sampleWorker.js";

import ServerConfig from "./config/serverConfig.js";
import apiRouter from "./routes/index.js";
import SubmissionWorker from "./workers/submissionWorker.js";
// import submissionQueueProducer from "./producers/submissionQueueProducer.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use('/api', apiRouter);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server started at *:${ServerConfig.PORT}`)

    // SampleWorker('SampleQueue');
    SubmissionWorker('SubmissionQueue');

//     const usercode = `
//     class Solution {
//         public:
//         vector<int> permute(){
//         vector<int> v;
//         v.push_back(10);
//         return v;
//         }
//     };
//     `
//     const code = `
//     #include <iostream>
//     #include <vector>
//     using namespace std;

//     ${usercode}

//     int main(){
    
//         Solution s;
//         vector<int> result = s.permute();
//         for(int x: result){
//             cout<<x<<" "; 
//         }
//         cout<<endl;
//         return 0;
//     }
//     `
// const inputCase = `100
// `

//     submissionQueueProducer({"1234": {
//         language: "CPP",
//         inputCase,
//         code
//     }});
});
