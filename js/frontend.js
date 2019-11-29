var account = 'stsjo17';
var sas = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-06-06T21:52:40Z&st=2019-11-19T14:52:40Z&spr=https&sig=Udb%2B589zvrDzocXpSQC5jA8cxhcDoOEdW2XEIiuA1JU%3D';
var fileShare = 'images';
var currentPath = '';
var fileUri = '';
var currentPath = [];
var showOculto = false;
// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("app02-ronef");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  stitch.RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the blog database
const db = mongodb.db("database02");
function displayMains() {
  db.collection("collection01")
    .find({}, {
      limit: 1000
    })
    .toArray()
    .then(docs => {
      /*const html = docs.map(doc => `
        <div class="card w-75">
          <div class="card-body">
          ${!doc.image ? ` ` : '<img width="100px" src="https://stsjo17.file.core.windows.net/' + fileShare + '/' + doc.image + sas + '" />'}
            <h5 class="card-title">${doc.title}</h5>
            <h6 class="card-title">${doc.subtitle}</h6>
            <p class="card-text">${doc.description}</p>
            <a class="btn btn-primary" href="${doc.reference}" target="_blank"><i class="fas fa-external-link-square-alt"></i></a>
          </div>
        </div>
        `);*/
        const html = docs.map(doc => `
          <article class="news">
            <div class="column-new-img">
                ${!doc.image ? ` ` : '<img class="img-new" width="100px" src="https://stsjo17.file.core.windows.net/' + fileShare + '/' + doc.image + sas + '" />'}
            </div>
            <div class="column-new-text">
              <h1 style="margin:0;padding:0">${doc.title}</h1>
              <p class="inline naranja nomargin">${doc.subtitle}</p>
              <p class="inline nomargin">${doc.description}</p>
              <br>
              <a class="inline naranja readmore-new" href="${doc.reference}" target="_blank">Leer Más</a>
            </div>
          </article>
        `);
      document.getElementById("datos").innerHTML = html;
      console.log(docs);
    });

}
function showOffCanvas(){
  document.getElementById("mobile-nav").style.display="block";
}
function hideOffCanvas(){
  document.getElementById("mobile-nav").style.display="none";
}
function listenScroll(){
  window.addEventListener('scroll',() => {
    if (window.scrollY > 620) {
      document.getElementById("arrow").style.display="inline";
      document.getElementById("navbar").classList.add("swing-in-top-fwd");
      document.getElementById("navbar").style.position="fixed";
      document.getElementById("navbar").style.backgroundColor="rgba(255, 255, 255, 0.80)";
    } else {
      document.getElementById("navbar").style.position="static";
      document.getElementById("navbar").style.backgroundColor="rgb(255, 255, 255)";
      document.getElementById("navbar").classList.remove("swing-in-top-fwd");
      document.getElementById("arrow").style.display="none";
    }
  })
}
function togglReadMore(){
  if (showOculto == false) {
    document.getElementById("oculto").style.display="inline";
    document.getElementById("readmore").innerHTML="Ocultar";
    showOculto = true;
  } else {
    document.getElementById("oculto").style.display="none";
    document.getElementById("readmore").innerHTML="Seguir leyendo...";
    showOculto = false;
  }
}
function displayMainsOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayMains)
    .catch(console.error);
}


//ejecuciones
listenScroll()
displayMainsOnLoad();
