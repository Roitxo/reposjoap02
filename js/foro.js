var account = 'stsjo22';
var sas = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-06-06T21:52:40Z&st=2019-11-19T14:52:40Z&spr=https&sig=Udb%2B589zvrDzocXpSQC5jA8cxhcDoOEdW2XEIiuA1JU%3D';
var fileShare = 'images';
var currentPath = '';
var fileUri = '';
var currentPath = [];
var showOculto = false;
var comments = [];
var fixed = [];
var engaged = [];
var counter = 5;
// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("app02-ronef");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the forum database
const db = mongodb.db("database02");
function showOffCanvas(){
  document.getElementById("mobile-nav").style.display="block";
}
function hideOffCanvas(){
  document.getElementById("mobile-nav").style.display="none";
}
function displayComments() {
  var commentArea = document.getElementById("comment-area");
  commentArea.innerHTML = " ";
  comments.forEach(element => {
    commentArea.innerHTML += `
      <h2>${element.titulo}</h2>
      <div class="inline date-box">
        <p class="inline">Fecha de publicación: ${element.fecha}</p>
      </div>
      <div class="inline likes-box">
        <div class="inline likes-buttons">
          <div class="inline like-counters">
            <button onclick="like('${element._id}')" type="button" name="button"><i id="like_${element._id}" class="far fa-thumbs-up"></i> ${element.likes}</button>
          </div>
          <div class="inline dislike-counters">
            <button onclick="dislike('${element._id}')" type="button" name="button"><i id="dislike_${element._id}" class="far fa-thumbs-down"></i> ${element.dislikes}</button>
          </div>
        </div>
      </div>
      <div class="block user-info">
        <i class="fas fa-user fa-3x"></i>
        <p class="rosa inline"><b>${element.autor}</b></p>
        <p class="comment-box">${element.comentario}</p>
      </div>
      <hr>
      <div class="responses">
        <div class="block user-info response input-response">
          <i class="fas fa-user fa-3x"></i>
          <input id="username_${element._id}" type="text" class="add-username" placeholder="Usuario">
          <input id="comment_${element._id}" type="text" class="add-comment" placeholder="Añade un comentario público...">
          <button onclick="newResponse('${element._id}', 'first')" class="flat rosa btn-responder" type="button" name="button">RESPONDER</button>
        </div>
    `;
    if (element.respuestas.length > 0) {
      element.respuestas.forEach(response => {
        commentArea.innerHTML += `
        <div class="block user-info response">

          <i class="fas fa-user fa-3x"></i>
          <p class="rosa inline"><b>${response.autor}</b></p>
          <p class="comment-box">${response.comentario}</p>
          <button onclick="newResponse('${element._id}', 'sec', '${response.autor}')" class="flat rosa" type="button" name="button">RESPONDER</button>
          <div class="inline likes-buttons">
            <div class="inline like-counters">
              <button onclick="Reslike('${element._id}', '${response._id}')" type="button" name="button"><i class="far fa-thumbs-up"></i> ${response.likes}</button>
            </div>
            <div class="inline dislike-counters">
              <button onclick="Resdislike('${element._id}', '${response._id}')" type="button" name="button"><i class="far fa-thumbs-down"></i> ${response.dislikes}</button>
            </div>
          </div>
          <hr>
        </div>
        `;
      })
      commentArea.innerHTML += `</div>`
    }
    commentArea.innerHTML += `</div>`;
  })
}
function addComment(){
  const newMainUsername = document.getElementById("username_newcomment");
  const newMainTitle = document.getElementById("title_newcomment");
  const newMainComment = document.getElementById("comment_newcomment");
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  //console.log("client.user id = ", client.auth.user.id);
  db.collection("foro")
    .insertOne({
      owner_id: client.auth.user.id,
      autor: newMainUsername.value,
      titulo: newMainTitle.value,
      comentario: newMainComment.value,
      likes: 0,
      dislikes: 0,
      fijado: false,
      fecha: dd + '/' + mm + '/' + yyyy,
      respuestas: []
    })
    .then(getComments);
  newMainUsername.value = "";
  newMainComment.value = "";
  newMainTitle.value = "";
}
function like(id){
  const objectId = new stitch.BSON.ObjectId(id);
  if (engaged.includes(id)) {
    alert("Ya le has dado like o dislike a este comentario");
  } else {
    db.collection("foro")
      .updateOne({
        "_id": objectId
      }, {$inc: {likes: 1}})
      .then(result => {
        console.log('Successfuly liked comment  ' + id);
        engaged.push(id);
        console.log(engaged);
        getComments();
        getFixed();
      });
      var btn = document.getElementById(`like_${id}`);
      btn.style.color="white";
      btn.style.backgroundColor="#10ce10";
  }
}
function Reslike(id,idRes){
  const objectId = new stitch.BSON.ObjectId(id);
  const resId = new stitch.BSON.ObjectId(idRes);
  if (engaged.includes(idRes)) {
    alert("Ya le has dado like o dislike a este comentario");
  } else {
    db.collection("foro")
      .updateOne({
        "_id": objectId,
        "respuestas._id": resId
      }, {$inc: {"respuestas.$.likes": 1}})
      .then(result => {
        console.log('Successfuly liked comment  ' + id);
        engaged.push(idRes);
        console.log(engaged);
        getComments();
        getFixed();
      });
      var btn = document.getElementById(`like_${id}`);
      btn.style.color="white";
      btn.style.backgroundColor="#10ce10";
  }
}
function Resdislike(id,idRes){
  const objectId = new stitch.BSON.ObjectId(id);
  const resId = new stitch.BSON.ObjectId(idRes);
  if (engaged.includes(idRes)) {
    alert("Ya le has dado like o dislike a este comentario");
  } else {
    db.collection("foro")
      .updateOne({
        "_id": objectId,
        "respuestas._id": resId
      }, {$inc: {"respuestas.$.dislikes": 1}})
      .then(result => {
        console.log('Successfuly liked comment  ' + id);
        engaged.push(idRes);
        console.log(engaged);
        getComments();
        getFixed();
      });
      var btn = document.getElementById(`like_${id}`);
      btn.style.color="white";
      btn.style.backgroundColor="#10ce10";
  }
}
function dislike(id){
  const objectId = new stitch.BSON.ObjectId(id);
  if (engaged.includes(id)) {
    alert("Ya le has dado like o dislike a este comentario");
  } else {
    db.collection("foro")
      .updateOne({
        "_id": objectId
      }, {$inc: {dislikes: 1}})
      .then(result => {
        console.log('Successfuly disliked comment  ' + id);
        engaged.push(id);
        getComments();
        getFixed();
      });
      var btn = document.getElementById(`dislike_${id}`);
      btn.style.color="white";
      btn.style.backgroundColor="#ed4949";
  }
}
function newResponse(id, context, user = null) {
  if (context == "first") {
    const newResponse = document.getElementById(`comment_${id}`);
    const newUsername = document.getElementById(`username_${id}`);
    if (newResponse.value == "" || newUsername.value == "") {
      alert("Debes rellenar todos los campos");
    } else {
      var newId = new stitch.BSON.ObjectId();
      const newComment = {
        "$push": {
          "respuestas": {
            "_id": newId,
            "autor": newUsername.value,
            "comentario": newResponse.value,
            "likes": 0,
            "dislikes": 0,
            "fecha": dd + '/' + mm + '/' + yyyy
          }
        }
      }
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      const objectId = new stitch.BSON.ObjectId(id);
      db.collection("foro")
        .updateOne({
          "_id": objectId
        }, newComment)
        .then(result => {
          console.log(result);
          getFixed();
          getComments();
          console.log('Successfuly sent a response to comment ' + id);
        });
      newResponse.value = "";
      newUsername.value = "";
    }
  } else if (context == "sec") {
    var add = document.getElementById("comment_"+id);
    add.value += "@"+user;
  }
}
function displayFixed() {
  var commentArea = document.getElementById("fixed-comments");
  commentArea.innerHTML = `<div class="container comments">
  <div id="newcomment" class="block user-info response">
    <i class="fas fa-user fa-3x"></i>
    <input id="username_newcomment" type="text" class="add-username" placeholder="Usuario">
    <input id="title_newcomment" type="text" class="add-comment" placeholder="Titulo de tu publicación...">
    <input id="comment_newcomment" type="text" class="add-comment" placeholder="Añade un comentario público...">
    <button onclick="addComment()" class="flat rosa btn-responder" type="button" name="button">COMENTAR</button>
  </div>`;
  fixed.forEach(element => {
    commentArea.innerHTML += `
      <i class="fas fa-thumbtack icono-fijado"></i>
      <h2>${element.titulo}</h2>
      <div class="inline date-box">
        <p class="inline">Fecha de publicación: ${element.fecha}</p>
      </div>
      <div class="inline likes-box">
        <div class="inline likes-buttons">
          <div class="inline like-counters">
            <button onclick="like('${element._id}')" type="button" name="button"><i id="like_${element._id}" class="far fa-thumbs-up"></i> ${element.likes}</button>
          </div>
          <div class="inline dislike-counters">
            <button onclick="dislike('${element._id}')" type="button" name="button"><i id="dislike_${element._id}" class="far fa-thumbs-down"></i> ${element.dislikes}</button>
          </div>
        </div>
      </div>
      <div class="block user-info">
        <i class="fas fa-user fa-3x"></i>
        <p class="rosa inline"><b>${element.autor}</b></p>
        <p class="comment-box">${element.comentario}</p>
      </div>
      <hr>
      <div class="responses">
        <div class="block user-info response input-response">
          <i class="fas fa-user fa-3x"></i>
          <input id="username_${element._id}" type="text" class="add-username" placeholder="Usuario">
          <input id="comment_${element._id}" type="text" class="add-comment" placeholder="Añade un comentario público...">
          <button onclick="newResponse('${element._id}', 'first')" class="flat rosa btn-responder" type="button" name="button">RESPONDER</button>
        </div>
    `;
    if (element.respuestas.length > 0) {
      element.respuestas.forEach(response => {
        commentArea.innerHTML += `
        <div class="block user-info response">

          <i class="fas fa-user fa-3x"></i>
          <p class="rosa inline"><b>${response.autor}</b></p>
          <p class="comment-box">${response.comentario}</p>
          <button onclick="newResponse('${element._id}', 'sec', '${response.autor}')" class="flat rosa" type="button" name="button">RESPONDER</button>
          <div class="inline likes-buttons">
            <div class="inline like-counters">
                <button onclick="Reslike('${element._id}', '${response._id}')" type="button" name="button"><i class="far fa-thumbs-up"></i> ${response.likes}</button>
            </div>
            <div class="inline dislike-counters">
            <button onclick="Resdislike('${element._id}', '${response._id}')" type="button" name="button"><i class="far fa-thumbs-down"></i> ${response.dislikes}</button>
            </div>
          </div>
          <hr>
        </div>
        `;
      })
      commentArea.innerHTML += `</div>`
    }
    commentArea.innerHTML += `</div>`;
  })
}
function getFixed(){
  db.collection("foro")
    .find({fijado:true}, {
      limit: counter,
    })
    .toArray()
    .then(docs => {
      fixed = docs;
      displayFixed();
    });
}
function getComments() {
  db.collection("foro")
    .find({fijado:false}, {
      limit: counter,
    })
    .toArray()
    .then(docs => {
      comments = docs;
      displayComments();
    });
}

function listenScroll() {
  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      counter += 5;
      getComments();
    }
  })
}
//ejecuciones
listenScroll();
getFixed();
