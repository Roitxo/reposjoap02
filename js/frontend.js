var account = 'stsjo17';
var sas = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-10-23T00:35:43Z&st=2019-10-22T16:35:43Z&spr=https&sig=%2FGnHVVRZNrIdPkleW62Fo7G15mOMHW02z3RClayV9qA%3D';
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
function displayMains() {
  db.collection("collection01")
    .find({}, {
      limit: 1000
    })
    .toArray()
    .then(docs => {
      const html = docs.map(doc => `
        <div class="card w-75">
          <div class="card-body">
          ${!doc.image ? ` ` : '<img width="100px" src="https://stsjo17.file.core.windows.net/' + fileShare + '/' + doc.image + sas + '" />'}
            <h5 class="card-title">${doc.title}</h5>
            <h6 class="card-title">${doc.subtitle}</h6>
            <p class="card-text">${doc.description}</p>
            <a href="#" class="btn btn-primary">Ver</a>
          </div>
        </div>
        `);
      document.getElementById("datos").innerHTML = html;
      console.log(docs);
    });

}

function displayMainsOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayMains)
    .catch(console.error);
}


//ejecuciones
displayMainsOnLoad();
