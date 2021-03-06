/**
 * @see http://www.tysoncadenhead.com/blog/exporting-canvas-animation-to-mov/
 * @see https://www.ffmpeg.org/
 *
 * ffmpeg -r 30 -i /tmp/frame-%04d.png -vcodec libx264 -vpre lossless_slow -threads 0 output.mp4
 * -r 30                    Framerate 30 FPS.
 * -i /tmp/frame-%04d.png   Input image sequence with four digit index.
 * -vcodec libx264
 * -vpre lossless_slow      Preset file.
 * -threads 0
 * output.mp4               Output file name.
 *
 * These work:
 * ffmpeg -r 30 -i tmp/frame-%04d.png -vcodec libx264 -threads 0 output.mp4
 * ffmpeg -f image2 -framerate 30 -i tmp/frame-%04d.png output.mp4
 */

const port = process.env.PORT || 3013;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs');

server.listen(port, () => {
	console.log('listening on %d', port);
});

app.get('web/', function (req, res) {
	res.sendFile(__dirname + 'index.html');
});

app.use(express.static('web'));

io.sockets.on('connection', function (socket) {
	socket.on('render-frame', function (data) {
		// Pad frame number with zreos so it's four characters in length.
		data.frame = (data.frame <= 99999) ? ('0000' + data.frame).slice(-5) : '99999';
		// Get rid of the data:image/png;base64 at the beginning of the file data
		data.file = data.file.split(',')[1];
		var buffer = new Buffer(data.file, 'base64');
		fs.writeFile(__dirname + '/tmp/frame_' + data.frame + '.png',
			buffer.toString('binary'),
			'binary',
			(err) => {
				if (err) {
					console.log('An error occurred: ', err);
					throw err;
				}
			});
	});
});
