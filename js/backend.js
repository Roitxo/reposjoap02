//vars
var account = 'stsjo17';
var sas = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-06-06T21:52:40Z&st=2019-11-19T14:52:40Z&spr=https&sig=Udb%2B589zvrDzocXpSQC5jA8cxhcDoOEdW2XEIiuA1JU%3D';
var fileShare = 'images';
var currentPath = '';
var fileUri = '';
var currentPath = [];
// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("app02-ronef");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the blog database
const db = mongodb.db("database02");
var entradas = null;


function checkParameters() {
  if (account == null || account.length < 1) {
    alert('Please enter a valid storage account name!');
    return false;
  }
  if (sas == null || sas.length < 1) {
    alert('Please enter a valid SAS Token!');
    return false;
  }

  return true;
}


function createFileFromStream(checkMD5) {
  var files = document.getElementById('files').files;
  if (!files.length) {
    //alert('Please select a file!');
    addMain();
    return;
  }
  var file = files[0];

  var fileService = getFileService();
  if (!fileService)
    return;

  var btn = document.getElementById("upload-button");
  btn.disabled = true;
  btn.innerHTML = "Uploading";
  var finishedOrError = false;
  var options = {
    contentSettings: {
      contentType: file.type
    },
    storeFileContentMD5: checkMD5
  };

  var speedSummary = fileService.createFileFromBrowserFile(fileShare, currentPath.join('\\\\'), file.name, file, options, function(error, result, response) {
    finishedOrError = true;
    btn.disabled = false;
    btn.innerHTML = "Upload";
    if (error) {
      alert("Upload failed, open browser console for more detailed info.");
      console.log(error);
      displayProcess(0);
    } else {
      // Upload Success !!
      //displayProcess(100);
      setTimeout(function() { // Prevent alert from stopping UI progress update
        alert('Upload successfully!');
      }, 1000);
      const newFiles = document.getElementById("files");
      newFiles.value = "";
      // Insert document in a collection of MongoDB data base
      const newMainTitle = document.getElementById("title");
      const newMainSubtitle = document.getElementById("subtitle");
      const newMainDescription = document.getElementById("description");
      const newMainReference = document.getElementById("ref");
      console.log("client.user id = ", client.auth.user.id)
      db.collection("collection01")
        .insertOne({
          owner_id: client.auth.user.id,
          title: newMainTitle.value,
          subtitle: newMainSubtitle.value,
          reference: newMainReference.value,
          description: newMainDescription.value,
          image: file.name
        })
        .then(displayMains);
      document.getElementById('add-new').style.display = 'block';
      newMainTitle.value = "";
      newMainSubtitle.value = "";
      newMainDescription.value = "";
      // Refresh directory file list
      refreshDirectoryFileList();
    }
  });

  speedSummary.on('progress', function() {
    var process = speedSummary.getCompletePercent();
    displayProcess(process);
  });
}

function refreshDirectoryFileList(directory) {
  var fileService = getFileService();
  if (!fileService)
    return;

  if (fileShare.length < 1) {
    alert('Please select one file share!');
    return;
  }

  if (typeof directory === 'undefined')
    var directory = '';
  if (directory.length > 0)
    currentPath.push(directory);
  directory = currentPath.join('\\\\');

  //document.getElementById('directoryFiles').innerHTML = 'Loading...';
  fileService.listFilesAndDirectoriesSegmented(fileShare, directory, null, function(error, results) {
    if (error) {
      alert('List directories and files error, please open browser console to view detailed error');
      console.log(error);
    } else {
      //document.getElementById('path').innerHTML = directory;

      var outputDirectory = [];
      outputDirectory.push('<tr>',
        '<th>Type</th>',
        '<th>Name</th>',
        '<th>ContentLength</th>',
        '<th>Image</th>',
        '</tr>');
      if (results.entries.directories.length < 1 && results.entries.files.length < 1) {
        outputDirectory.push('<tr><td>Empty results...</td></tr>');
      }
      for (var i = 0, dir; dir = results.entries.directories[i]; i++) {
        outputDirectory.push('<tr>',
          '<td>', 'DIR', '</td>',
          '<td>', dir.name, '</td>',
          '<td>', dir.contentLength, '</td>',
          '<td>', '<button class="btn btn-xs btn-danger" onclick="deleteDirectory(\'', dir.name, '\')">Delete</button> ',
          '<button class="btn btn-xs btn-success" onclick="refreshDirectoryFileList(\'', dir.name, '\')">View</button>', '</td>',
          '</tr>');
      }

      var outputFiles = [];
      var currentDir = currentPath.join('\\');
      if (currentPath.length > 0)
        currentDir += '/';

      for (var i = 0, file; file = results.entries.files[i]; i++) {
        outputFiles.push('<tr>',
          '<td>', 'FILE', '</td>',
          '<td>', file.name, '</td>',
          '<td>', file.contentLength, '</td>',
          '<td>', '<img width="200px" src="https://easdibsjost.file.core.windows.net/' + fileShare + '/' + file.name + sas + '" />', '</td>',
          '</tr>');
      }
      //document.getElementById('directoryFiles').innerHTML = '<table class="table table-condensed table-bordered">' + outputDirectory.join('') + outputFiles.join('') + '</table>';
    }
  });
}

function getFileService() {
  if (!checkParameters())
    return null;

  fileUri = 'https://' + account + '.file.core.windows.net';
  var fileService = AzureStorage.File.createFileServiceWithSas(fileUri, sas).withFilter(new AzureStorage.File.ExponentialRetryPolicyFilter());
  console.log(fileService);
  return fileService;
}
function deleteRes(id, idRes){
  const objectId = new stitch.BSON.ObjectId(id);
  const resId = new stitch.BSON.ObjectId(idRes);
}
function displayProcess(process) {
  document.getElementById('progress').style.width = process + '%';
  document.getElementById('progress').innerHTML = process + '%';
}

function displayMains() {
  db.collection("collection01")
    .find({}, {
      limit: 1000
    })
    .toArray()
    .then(docs => {
      const html = docs.map(doc => `
        <tr>
          <td>${!doc.image ? `<img width="100px" src="img/noImageUploaded.png" />` : '<img width="100px" src="https://stsjo17.file.core.windows.net/' + fileShare + '/' + doc.image + sas + '" />'}</td>
          <td>${doc.title}</td>
          <td>${doc.subtitle}</td>
          <td>${doc.description}</td>
          <td>
            <button type="button" class="btn btn-danger" onclick="deleteOne('${doc._id}')"><i class="fas fa-trash-alt"></i></button>
            <a class="btn btn-primary" href="${doc.reference}" target="_blank"><i class="fas fa-external-link-square-alt"></i></a>
          </td>
        </tr>
        `);
      document.getElementById("tbody").innerHTML = html;
      entradas = docs;
    });

}

function togglModal(val) {
  if (val == "mostrar") {
    document.getElementById('add-new').style.display = 'block';
  } else if (val == "ocultar") {
    document.getElementById('add-new').style.display = 'none';
  }

}

function displayMainsOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayMains)
    .catch(console.error);
}

function displayForum() {
  db.collection("foro")
    .find({}, {
      limit: 1000
    })
    .toArray()
    .then(docs => {
      docs.forEach(doc => {
        var btn = doc.fijado == false ? `<button type="button" class="btn btn-primary" onclick="fixComment('${doc._id}')"><i class="fas fa-thumbtack"></i></button>` :
          `<button type="button" class="btn btn-danger" onclick="unfixComment('${doc._id}')"><i class="fas fa-thumbtack"></i></button>`
        document.getElementById("tbody").innerHTML += `<tr>
            <td>${doc.autor}</td>
            <td>${doc.titulo}</td>
            <td>${doc.comentario}</td>
            <td>
              <button type="button" class="btn btn-danger" onclick="deleteForum('${doc._id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
            <td>
              ${btn}
            </td>
          </tr>
          `;
        doc.respuestas.forEach((respuesta, index) => {
          document.getElementById("tbody").innerHTML += `<tr class="table-primary">
              <td>${respuesta.autor}</td>
              <td>RESPUESTA</td>
              <td>${respuesta.comentario}</td>
              <td>
                <button type="button" class="btn btn-danger" onclick="deleteResForum('${doc._id}', '${respuesta._id}')"><i class="fas fa-trash-alt"></i></button>
              </td>
              <td>
              </td>
            </tr>
            `;
        })
      })
    });
}

function fixComment(id) {
  const objectId = new stitch.BSON.ObjectId(id);
  db.collection("foro")
    .updateOne({
      "_id": objectId
    }, {
      "$set": {
        "fijado": true
      }
    }).then(()=>{
      document.getElementById("tbody").innerHTML = '';
      displayForum();
    })
}

function unfixComment(id) {
  const objectId = new stitch.BSON.ObjectId(id);
  db.collection("foro")
    .updateOne({
      "_id": objectId
    }, {
      "$set": {
        "fijado": false
      }
    }).then(()=>{
      document.getElementById("tbody").innerHTML = '';
      displayForum();
    })
}

function deleteResForum(id, idRes) {
  const objectId = new stitch.BSON.ObjectId(id);
  const resId = new stitch.BSON.ObjectId(idRes);
  db.collection("foro")
    .updateOne({
      "_id": objectId,
      "respuestas._id": resId
    }, {
      "$set": {
        "respuestas.$.comentario": "<span class='cursiva'>Comentario eliminado por un administrador</span>"
      }
    }).then(()=>{
      document.getElementById("tbody").innerHTML = '';
      displayForum();
    })
}

function deleteForum(id) {
  //const deleteMain = document.getElementById("delete_main");
  const objectId = new stitch.BSON.ObjectId(id);
  db.collection("foro")
    .deleteOne({
      _id: objectId
    })
    .then(()=>{
      document.getElementById("tbody").innerHTML = '';
      displayForum();
    })
  //alert(id);
}

function deleteOne(id) {
  //const deleteMain = document.getElementById("delete_main");
  const objectId = new stitch.BSON.ObjectId(id);
  db.collection("collection01")
    .deleteOne({
      _id: objectId
    })
    .then(displayMains)
  //alert(id);
}

  function displayForumOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayForum)
    .catch(console.error);
}

function addMain() {
  const newMainTitle = document.getElementById("title");
  const newMainSubtitle = document.getElementById("subtitle");
  const newMainDescription = document.getElementById("description");
  const newMainReference = document.getElementById("ref");
  //console.log("client.user id = ", client.auth.user.id);
  db.collection("collection01")
    .insertOne({
      owner_id: client.auth.user.id,
      title: newMainTitle.value,
      subtitle: newMainSubtitle.value,
      reference: newMainReference.value,
      description: newMainDescription.value
    })
    .then(displayMains);
  document.getElementById('add-new').style.display = 'block';
  newMainTitle.value = "";
  newMainSubtitle.value = "";
  newMainDescription.value = "";
}

//ejecuciones

console.log(entradas);
