import axios from "axios";
import { reduce, unnest, filter, mean, composeP, compose } from "ramda";
/*
* Broadly Interview
* Challenge => http://challenge.broadly.com/
*
*/

//get all classes
async function getAllClasses() {
  console.log("Making Request to classes....");

  const allClasses = await axios.get("http://challenge.broadly.com/classes");
  return Promise.all(allClasses.data.classes.map(async eachClass => {
    const room = await axios.get(eachClass);
    return room.data;
  }));
};

function getMeanStudents(rooms) {
  const result = Promise.all(rooms.map(room => returnNextPageResults(room))).then(res => mean(res));
  return result;
};

function returnMeanEvaluation(value) {
  console.log(`The mean value of all students is ${value}`);
  return value;
};

function returnNextPageResults(room) {
  if (!room) return;
  return new Promise((resolve, reject) => {
    let students = room.students;
    //each of the student rooms have a next
    requestPage((room || {}).next, nextSet => {
      if (room.room === nextSet.room) {
        students.push(nextSet.students);
      }
    }, () => {
      //question says ignore those less than 25 years
      console.log(`Evaluating Room ${room.room}`);
      resolve(filter(n => n.age > 25, unnest(students)).length);
    }, (error) => {
      reject(error);
    });
  });
};

function requestPage(url, receive, complete, reject) {
  if (!url) return complete();
  axios.get(url)
    .then(res => {
      const response = res.data;
      receive(response);
      requestPage((response || {}).next, receive, complete, reject);
    }).catch(error => {
      console.error("Failed to retrieve next page", error);
      return reject(error);
    });
};

composeP(returnMeanEvaluation, getMeanStudents, getAllClasses)();

//ignore students that are less than 25 years
//get the results
//get the average of the number of students in each class
//an average is the sum of the number of students divided by the numbers of the students there are
