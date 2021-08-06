const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');
/****** SUBMIT PHOTO ********/
exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    if(title && title.length <= 25 && author && author.length <= 50 && email && file) { // if fields are not empty...
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      
      const textPattern = /^[A-Z|a-z|0-9|_|-| ]{1,}$/;
      const correctTitle = title.match(textPattern).join('');
      const correctAuthor = author.match(textPattern).join('');
      
      const emailPattern = /^[A-Z|a-z|0-9]+@[A-Z|a-z|0-9]+\.[a-zA-Z]{2,4}$/;
      const correctEmail = email.match(emailPattern).join('');
      
      if(fileExt === 'jpg' || fileExt === 'gif' || fileExt === 'png' && title === correctTitle && author === correctAuthor && email === correctEmail){
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong input!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch(err) {
    res.status(500).json(err);
  }
};
/****** LOAD ALL PHOTOS ********/
exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }
};
/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) {
      res.status(404).json({ message: 'Not found' });
      return false;
    }

    const voteForFoto = () => {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    };

    const clientIp = requestIp.getClientIp(req);
    const voter = await Voter.findOne({ user: clientIp });

    if(voter) {
      const isVoted = voter.votes.find(el => el == req.params.id);
      if(!isVoted) {
        voter.votes.push(req.params.id)
        await voter.save();
        voteForFoto();
      } else{
        res.status(500).json('You can`t vote on this picture again!');
      }
    } else {
       const newVoter = new Voter({user: clientIp, votes: [req.params.id]});
       await newVoter.save();
       voteForFoto();
    }


  } catch(err) {
    res.status(500).json(err);
  };

};