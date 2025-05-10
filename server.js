const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.set('trust proxy', true);

const cors = require("cors")
app.use(cors())

let messages = require('./messages.json');
let tickets = require('./tickets.json');
let reports = require('./reports.json');
let users = require('./users.json');

const bannedWords = ["cazzo", "stronzo", "vaffanculo", "merda", "puttana", "porca", "bastardo", "deficiente", "stupido", "idiota", "tette", "figa", "Jeffrey", "Kid", "Rimasto", "Rimasta",
      "schifoso", "cretino", "minchia", "bastardi", "coglione", "troia", "puzza", "pezzo di merda", "figlio di puttana",
      "fanculo", "stronza", "cazzone", "merdoso", "porcone", "bastardone", "scemo", "stupida", "vaffanculista", "porcatrice",
      "casinaro", "puttaniere", "trombarella", "boccalone", "cazzata", "scorreggiona", "stronzetta", "figliodi", "maledetto",
      "figlio di troia", "sborrata", "ragazzo di merda", "pianale", "sborone", "trombato", "cazzoso", "senza culo", "puzzone",
      "testone", "culo", "disgraziato", "fottuto", "mentecatto", "mangia merda", "puttaniella", "segaiolo", "stronzaggine",
      "imbecille", "beccaccio", "pezzo di merda", "figlio di cane", "puttanone", "zozzone", "capra", "femminuccia", "puttanaio",
      "focaccia", "stronza", "deficiente", "attaccato al culo", "cazzone", "beccaccio", "pezzo di merda", "figlio di cane",
      "puttaniere", "rompicoglioni", "parolaccia", "mammone", "truzzo", "schiaffo", "cazzum", "topo", "cogliona", "pupone",
      "vaffanculista", "troione", "scovato", "ciompa", "psicotico", "scantato", "sfaticato", "sesso", "incestuoso", "veggente",
      "cappellone", "cacca", "futurista", "trombata", "cornuto", "castratore", "pellegrino", "porco", "porcheria", "bustone",
      "inverosimile", "cazzuto", "merdazza", "cazzolone", "sdentato", "arrapata", "arrapato", "vucumprà", "zingaro", "omosessuale",
      "traditore", "bugiarda", "fessacchiotta", "bastardone", "penoso", "stronzo", "carcassa", "sporcaccione", "scapolo",
      "disperato", "inconstante", "testardo", "odioso", "affamato", "stupidamente", "dissoluto", "minchione", "delirante",
      "spregevole", "indegno", "burlone", "cecato", "masturbatore", "vitellone", "odioso", "rompiballe", "stravolto", "disgustoso",
      "schifosissimo", "limone", "follia", "addio", "plagio", "disperato", "immorale", "inferno", "maledicente", "rovinato",
      "perdente", "pessimo", "porco dio", "tracollo", "frega", "turbato", "insopportabile", "sporcaccione", "glorioso",
      "sfasciato", "tossico", "aggressivo", "volgare", "oppressivo", "ignobile", "gallina", "mulo", "lupo", "pasticcio", "macho",
      "disonesto", "piagnone", "pascere", "sexy", "taroccato", "zibetto", "gigante", "donnicciola", "cucchiaio", "furbone",
      "giocattolone", "minchia", "soffiatore", "scorretto", "strillo", "fag", "bitch", "bastard", "asshole", "dick", "cunt", "slut",
      "whore", "fuck", "shit", "motherfucker", "cock", "pussy", "bastards", "bitches", "douchebag", "prick", "twat", "faggot",
      "cockhead", "piss", "jerk", "dickhead", "dickwad", "asswipe", "cocksucker", "bastardly", "cocktail", "bitchy", "sodomite",
      "cuntbag", "fucking", "nigga", "wanker", "skank", "assholeish", "shithead", "shitter", "faggotry", "asshat", "twats",
      "shitface", "clit", "fucktard", "cocknose", "mothafucka", "dickless", "cum", "fucked", "buttplug", "shitstorm",
      "poop", "bastardization", "suck", "cocksucker", "dumbass", "trash", "spermcannon", "cockroach", "retard", "gimp",
      "prostitute", "gash", "bitchslap", "cumbucket", "numbnuts", "jackass", "wank", "cumshot", "scrub", "jizz", "cockblock",
      "shithead", "bastardization", "assclown", "bitchass", "pisshead", "fucknut", "muff", "twatface", "chode", "cockfucker",
      "asskiss", "buttsex", "cumdumpster", "cockmongler", "douche", "shitstain", "cockwomble", "assbandit", "slutbag",
      "skumbag", "motherfuckerish", "fuckface", "shitfaced", "assholey", "retarded", "pussyhole", "clitface", "crackwhore",
      "assgoblin", "cocksniffer", "twathead", "crackwhore", "fuckmonkey", "dirtywhore", "pervert", "shitlicker", "cocklips",
      "Jeffrey", "LGBT", "Pornhub", "OnlyFans", "pagliaccio", "assassino", "Satanista", "clown", "satanist", "LGBTQIA", "gay", "LGBTQ", "LGBTQI", "lesbian",
      "lesbica", "bi", "bisessuale", "bisexual", "bisex", "zebby", "zeb", "shisharop", "rimasto", "hate", "negro", "chicamala", "fascista", "nazista", "fascist", "nazist", "nazi", "sborra",
      "stronzetto", "scorreggione", "puttanone", "Puttanona", "merda", "stronzone", "killer", "raided", "nuked", "sex", "gyatt", "gyattona", "gyattone", "cartagho delenda est", "cazzone",          
      "scemo", "deficiente", "idiota", "stupido", "cretino", "perdente", "sfigato", "fallito", "pazzo", 
      "inutile", "frocio", "lesbica", "bastardo", "porco", "stronzo", "imbecille", "idiota", "assassino", "killer"
];
const bannedUserIds = ['', 'userToBan2'];
let explorerUsers = [];

function filterMessage(message) {
  let filteredMessage = message;
  bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredMessage = filteredMessage.replace(regex, '[censured]');
  });
  return filteredMessage;
}

function getUserRole(userId) {
  const roles = {
    'Alfieri': 'admin',
    'admin2': 'moderator',
    'Guestisback': 'owner'
  };
  return roles[userId] || '';
}

function isValidAdmin(userId) {
  const role = getUserRole(userId);
  return role === 'owner' || role === 'admin' || role === 'moderator';
}

function isBanned(userId) {
  return bannedUserIds.includes(userId);
}

function assignExplorerRole(userId) {
  if (!explorerUsers.includes(userId)) {
    explorerUsers.push(userId);
    users.forEach(user => {
      if (user.userId === userId) {
        user.role = 'Explorer';
      }
    });
    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('./explorerUsers.json', JSON.stringify(explorerUsers, null, 2));
  }
}

let homepage = 'index.html';

app.post('/switch-homepage', (req, res) => {
  homepage = 'home.html';
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  const userId = req.query.userId;

  if (userId && isBanned(userId)) {
    return res.redirect('/ban');
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'countdown.html'));
});

app.get('/ban', (req, res) => {
  res.sendFile(path.join(__dirname, 'ban.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'support.html'));
});

app.get('/admin/reports/logs', (req, res) => {
  res.sendFile(path.join(__dirname, 'reports-logs.html'));
});

app.get('/guidelines', (req, res) => {
  res.sendFile(path.join(__dirname, 'guide-lines.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'policy.html'));
});

app.get('/pc/download', (req, res) => {
  res.sendFile(path.join(__dirname, 'download.html'));
});

app.get('/event/inviter', (req, res) => {
  res.sendFile(path.join(__dirname, 'inviter.html'));
});

app.get('/offline', (req, res) => {
  res.sendFile(path.join(__dirname, 'offline.html'));
});

app.get('/admin', (req, res) => {
  const userId = req.query.userId;
  if (isValidAdmin(userId)) {
    res.sendFile(path.join(__dirname, 'admin.html'));
  } else {
    res.status(403).sendFile(path.join(__dirname, '403.html'));
  }
});

app.get('/messages', (req, res) => {
  const filteredMessages = messages.map(message => {
    const { ip, ...rest } = message;
    return rest;
  });
  res.json(filteredMessages);
});

app.post('/messages', (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ status: 'UserId o messaggio mancanti' });
  }

  if (isBanned(userId)) {
    return res.status(403).json({ status: 'Il tuo account è stato bannato. Non puoi inviare messaggi.' });
  }

  const filteredMessage = filterMessage(message);
  const messageId = 'msg-' + Date.now();
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;
  const role = getUserRole(userId);

  const newMessage = { userId, message: filteredMessage, messageId, timestamp, ip, role };

  messages.push(newMessage);
  fs.writeFileSync('./messages.json', JSON.stringify(messages, null, 2));

  if (message === "Welcome2025") {
    assignExplorerRole(userId);
    return res.json({ status: 'Messaggio inviato', message: newMessage, roleAssigned: 'Explorer' });
  }

  res.json({ status: 'Messaggio inviato', message: newMessage });
});

app.put('/messages/:messageId', (req, res) => {
  const { messageId } = req.params;
  const { userId, newMessage } = req.body;

  const message = messages.find(msg => msg.messageId === messageId);

  if (message && message.userId === userId) {
    message.message = filterMessage(newMessage) + " (modificato)";
    message.timestamp = new Date().toISOString();
    fs.writeFileSync('./messages.json', JSON.stringify(messages, null, 2));
    res.json({ status: 'Message updated' });
  } else {
    res.status(403).json({ status: 'Forbidden' });
  }
});

app.delete('/messages/:messageId', (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  const messageIndex = messages.findIndex(msg => msg.messageId === messageId);

  if (messageIndex !== -1 && messages[messageIndex].userId === userId) {
    messages.splice(messageIndex, 1);
    fs.writeFileSync('./messages.json', JSON.stringify(messages, null, 2));
    res.json({ status: 'Message deleted' });
  } else {
    res.status(403).json({ status: 'Forbidden' });
  }
});

app.post('/report', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: 'Errore: Nessun dato ricevuto' });
  }

  const { userId, reportMessage, reportType } = req.body;

  if (!userId || !reportMessage || !reportType) {
    return res.status(400).json({ status: 'Dati segnalazione incompleti' });
  }

  const reportId = 'report-' + Date.now();
  const timestamp = new Date().toISOString();

  const newReport = {
    reportId,
    userId,
    reportMessage: filterMessage(reportMessage),
    reportType,
    timestamp,
    status: 'In attesa',
    createdAt: new Date()
  };

  reports.push(newReport);
  fs.writeFileSync('./reports.json', JSON.stringify(reports, null, 2));

  res.json({
    status: 'Segnalazione inviata con successo!',
    reportId: newReport.reportId
  });
});

app.get('/admin/reports', (req, res) => {
  const userRole = getUserRole(req.query.userId);

  if (userRole === 'owner' || userRole === 'admin' || userRole === 'moderator') {
    res.json(reports);
  } else {
    res.status(403).json({ status: 'Accesso non autorizzato' });
  }
});

app.put('/report/:reportId', (req, res) => {
  const { reportId } = req.params;
  const { action } = req.body;

  const report = reports.find(r => r.reportId === reportId);

  if (report) {
    if (action === 'risolto') {
      report.status = 'Risolto';
      report.updatedAt = new Date();
    } else if (action === 'chiuso') {
      report.status = 'Chiuso';
      report.updatedAt = new Date();
    } else {
      return res.status(400).json({ status: 'Azione non valida' });
    }

    fs.writeFileSync('./reports.json', JSON.stringify(reports, null, 2));
    res.json({ status: 'Segnalazione aggiornata', newStatus: report.status });
  } else {
    res.status(404).json({ status: 'Segnalazione non trovata' });
  }
});

app.post('/support', (req, res) => {
  const { nome, email, messaggio } = req.body;

  if (!nome || !email || !messaggio) {
    return res.status(400).json({ status: 'Dati ticket incompleti' });
  }

  const ticketId = 'ticket-' + Date.now();
  const timestamp = new Date().toISOString();

  const newTicket = {
    ticketId,
    nome,
    email,
    messaggio: filterMessage(messaggio),
    status: 'In attesa',
    timestamp
  };

  tickets.push(newTicket);
  fs.writeFileSync('./tickets.json', JSON.stringify(tickets, null, 2));

  res.json({
    status: 'Ticket inviato con successo!',
    message: 'Il tuo ticket è stato messo in carico e sarà trattato dal nostro team. Ti aggiorneremo quanto prima.',
    ticketId: newTicket.ticketId
  });
});

app.get('/admin/tickets', (req, res) => {
  const userRole = getUserRole(req.query.userId);

  if (userRole === 'owner' || userRole === 'admin' || userRole === 'moderator') {
    res.json(tickets);
  } else {
    res.status(403).json({ status: 'Accesso non autorizzato' });
  }
});

app.put('/support/ticket/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const { action } = req.body;

  const ticket = tickets.find(t => t.ticketId === ticketId);

  if (ticket) {
    if (action === 'risolto') {
      ticket.status = 'Risolto';
      ticket.updatedAt = new Date();
    } else if (action === 'chiudi') {
      ticket.status = 'Chiuso';
      ticket.updatedAt = new Date();
    } else {
      return res.status(400).json({ status: 'Azione non valida' });
    }

    fs.writeFileSync('./tickets.json', JSON.stringify(tickets, null, 2));
    res.json({ status: 'Ticket aggiornato', newStatus: ticket.status });
  } else {
    res.status(404).json({ status: 'Ticket non trovato' });
  }
});

app.post('/register', (req, res) => {
  const { userId, role } = req.body;
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress;

  if (!userId || !role) {
    return res.status(400).json({ status: 'Dati di registrazione incompleti' });
  }

  const newUser = {
    userId,
    role,
    ip,
    createdAt: new Date()
  };

  users.push(newUser);
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

  res.json({ status: 'Utente registrato con successo', userId: newUser.userId });
});

app.listen(port, () => {
  console.log(`Server attivo su porta ${port}`)
})