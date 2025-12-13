<h1>Évaluation Commerciale — Projet BE</h1>



<p>

&nbsp; Application web pour la gestion des ventes par commerciaux, le suivi par squad (gestionnaire) et l’administration

&nbsp; (utilisateurs / squads / classement). Inclut une messagerie interne.

</p>



<hr />



<h2>Stack</h2>

<ul>

&nbsp; <li>Frontend : React</li>

&nbsp; <li>Backend : Node.js + Express</li>

&nbsp; <li>ORM : Sequelize</li>

&nbsp; <li>Base de données : MySQL</li>

</ul>



<h2>Structure du projet</h2>

<pre>

client/   (React)

server/   (Express + Sequelize)

</pre>



<h2>Installation</h2>



<h3>1) Cloner le projet</h3>

<pre><code>git clone https://github.com/esrabs/evaluation-commerciale-be.git

cd evaluation-commerciale-be

</code></pre>



<h3>2) Backend</h3>

<pre><code>cd server

npm install

npm run dev

</code></pre>



<p>Le serveur démarre sur : <b>http://localhost:3004</b></p>



<h3>3) Frontend</h3>

<pre><code>cd ../client

npm install

npm start

</code></pre>



<p>Le client démarre sur : <b>http://localhost:3000</b></p>



<h2>Configuration</h2>

<p>

&nbsp; Créer un fichier <code>.env</code> dans <code>server/</code> (ne pas le push sur GitHub).

</p>



<pre><code>DB\_NAME=eval\_commerciale

DB\_USER=root

DB\_PASS=mot\_de\_passe\_mysql

JWT\_SECRET=supersecret

</code></pre>



<h2>Rôles</h2>

<ul>

&nbsp; <li><b>ADMIN</b> : gestion des utilisateurs, squads, classement global, messages</li>

&nbsp; <li><b>GESTIONNAIRE</b> : voir les ventes de sa squad, stats squad, messages</li>

&nbsp; <li><b>COMMERCIAL</b> : ajouter ses ventes, voir ses ventes, messages</li>

</ul>



<h2>Endpoints principaux (Backend)</h2>

<ul>

&nbsp; <li><code>POST /auth/register</code> : création utilisateur</li>

&nbsp; <li><code>POST /auth/login</code> : connexion + token</li>

&nbsp; <li><code>GET /users</code> : liste utilisateurs (ADMIN)</li>

&nbsp; <li><code>GET /users/contacts</code> : liste destinataires (tous rôles)</li>

&nbsp; <li><code>POST /ventes</code> : ajouter une vente (COMMERCIAL)</li>

&nbsp; <li><code>GET /ventes/me</code> : ventes du commercial connecté</li>

&nbsp; <li><code>GET /ventes/squad</code> : ventes de la squad (GESTIONNAIRE)</li>

&nbsp; <li><code>GET /stats/classement</code> : classement global (ADMIN)</li>

&nbsp; <li><code>GET /stats/squad</code> : stats squad (GESTIONNAIRE)</li>

&nbsp; <li><code>GET /messages/recus</code> : messages reçus</li>

&nbsp; <li><code>GET /messages/envoyes</code> : messages envoyés</li>

&nbsp; <li><code>POST /messages</code> : envoyer message</li>

</ul>



<h2>Collaboration Git</h2>

<ul>

&nbsp; <li>Faire <code>git pull</code> avant de coder</li>

&nbsp; <li>Faire des commits petits et clairs</li>

&nbsp; <li>Ne jamais push le fichier <code>.env</code></li>

</ul>



<hr />



<p><i>Projet académique — ING1 S5</i></p>



