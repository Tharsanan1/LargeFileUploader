import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { css } from 'react-emotion';
// First way to import
import { ClipLoader } from 'react-spinners';
const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;
class App extends Component {
  constructor(props){
    super(props)
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      console.log("good to go");
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
    this.state = {
      count : 0,
      total : 0,
      loading: false,
      percentage: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    
  }
  async handleChange(files){
    this.setState({
      total:files.length,
      loading: true,
    });
    for(let i = 0; i < files.length; i++){
      this.setState({
        count : i
      });
      let flag = await getConnectionForExtention(files[i].name);
      if(flag){
        await sendThisFile(files[i], this);
      }
      flag = await makeEndRequest();
      if(!flag){
        return;
      }
    }
    this.setState({
      count : files.length,
      loading: false,
    });
  }
  
  
  render() {
    return (
      <div>
        <input 
          type="file" 
          id="files" 
          name="files[]" 
          multiple
          onChange={ 
            (e) => this.handleChange(e.target.files)
          } 
        />
        <br/>
        <label>{this.state.count} out of {this.state.total}</label>
        <br/>
        <ClipLoader
          className={override}
          sizeUnit={"px"}
          size={50}
          color={'#123abc'}
          loading={this.state.loading}
        />
        <br/>
        {this.state.loading ? <label >{this.state.percentage}%</label> : null}
      </div>
    );
  }
}

function getConnectionForExtention(name){
  return(new Promise(function(resolve){
    axios.get('http://localhost:8081/create?name='+(name))
    .then(function (response) {
      resolve(true);
    })
    .catch(function (error) {
      resolve(false);
    });
  }))
  
}


async function sendThisFile(file, obj){
  let start = 0;
  let interval = 17000;
  let end = 17000
  let fileSize = file.size;
  while(true){
    if(end > fileSize){
      end = fileSize - 1;
    }
    obj.setState({
      percentage : ((end / fileSize) * 100).toFixed(2)
    });
    if(start >= file.size){
      return true;
    }
    let flag = await blobThisFileAndSend(file, start, end);
    if(!flag){
      return;
    }
    start = end+1;
    end = end + interval;
  }
}

function blobThisFileAndSend(file, start, end){
  return new Promise(function(resolve){
    let reader = new FileReader();
    reader.onloadend = async function (evt){
      if (evt.target.readyState === FileReader.DONE) { // DONE == 2
        let data = evt.target.result
        let flag = await sendData(data);
        if(!flag){
          resolve(false);
        }
        else{
          resolve(true);
        }
      }
    }
    var blob = file.slice(start, end + 1);
    reader.readAsBinaryString(blob);
  });
  
}
function sendData(data){
  return new Promise(function(resolve){

    axios.post('http://localhost:8081/', {
          data: data
        })
        .then(function (response) {
          resolve(true);
        })
        .catch(function (error) {
          resolve(false);
        });
  })
}
function makeEndRequest(){
  return new Promise(function(resolve){
    axios.get('http://localhost:8081/end')
    .then(function (response) {
      resolve(true);
    })
    .catch(function (error) {
      resolve(false);
    });
  });
}

export default App;
























// function recursiveUpload(file, start, stop){
//   return new Promise(function(resolve){
//     if(start === file.size){
//       axios.get('http://localhost:8081/end')
//         .then(function (response) {
//           console.log(file.name);
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//       resolve(true);
//     }
//     if(stop > file.size){
//       stop = file.size - 1;
//     }
//     if(stop === start){
//       resolve(true);
//     }
//     var reader = new FileReader();
//     // If we use onloadend, we need to check the readyState.
//     reader.onloadend = (evt) => {
//       if (evt.target.readyState === FileReader.DONE) { // DONE == 2
//         console.log((stop/file.size )*100)
//         let arr = evt.target.result
//         axios.post('http://localhost:8081/', {
//           data: arr
//         })
//         .then(function (response) {
//           recursiveUpload(file, stop+1, stop+17000)
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//       }
//     }
//     var blob = file.slice(start, stop + 1);
//     reader.readAsBinaryString(blob);
//   }); 
// }