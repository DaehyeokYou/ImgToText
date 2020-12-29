//input
const input_img = document.getElementById('input-img');
//const input_canvas = document.getElementById('input-canvas');
//const input_canvas_ctx = input_canvas.getContext('2d');
//output
const output_text = document.getElementById('output-txt');

//language setting
const language = 'eng'

//create worker
const worker = new Tesseract.createWorker({
  logger: progressUpdate,
});

// paste Event
document.onpaste = function(pasteEvent) {
  // consider the first item (can be easily extended for multiple items)
  var item = pasteEvent.clipboardData.items[0];
 
  if (item.type.indexOf("image") === 0) {
    var blob = item.getAsFile();
 
    var reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById("input-img").src = event.target.result;
    };
 
	reader.readAsDataURL(blob);
	play();
  }
}

//drag and drop evnet
function dargOverHandler(e) {
	e.preventDefault();
}
async function dropHandler(e){
	e.stopPropagation();
    e.preventDefault();
    var file = e.dataTransfer.files[0]
	var reader = new FileReader();
	reader.onload = function(e){
		input_img.src = e.target.result;
	};
	reader.readAsDataURL(file);
  	await worker.load();
  	await worker.loadLanguage(language);
  	await worker.initialize(language);
  	const { data } = await worker.recognize(file);
  	result(data);
};

function progressUpdate(packet){
	if(output_text.firstChild && output_text.firstChild.status === packet.status) {
		if('progress' in packet){
			var progress = output_text.firstChild.querySelector('progress');
			progress.value = packet.progress;
		}
	} else if(packet.status == 'done'){
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div');
		status.className = 'status';
		status.appendChild(document.createTextNode(packet.status));
		line.appendChild(status);

		var pre = document.createElement('pre');
		pre.appendChild(document.createTextNode(packet.data.text));
		pre.style.border = '1px solid black'
			
		var a = document.createElement('a');
		a.href = packet.data.text;

		line.innerHTML = '';
		a.appendChild(pre);
		line.appendChild(a);

		output_text.removeChild(document.getElementById('loader'));
		output_text.insertBefore(line, output_text.firstChild);
	}
}

async function play(){
	var loader = document.createElement('div');
	loader.id = 'loader';
	loader.className = 'loader';
	output_text.appendChild(loader);
	/*
	output_text.style.display = 'block'
	output_text.innerHTML = ''
	*/
	await worker.load();
	await worker.loadLanguage(language);
	await worker.initialize(language);
	const { data } = await worker.recognize(input_img);
	result(data);
}

function result(res){
	console.log('result was:', res)
	progressUpdate({ status: 'done', data: res })
}

/*
function progressUpdate(packet){
	if(output_text.firstChild && output_text.firstChild.status === packet.status) {
		if('progress' in packet){
			var progress = output_text.firstChild.querySelector('progress');
			progress.value = packet.progress;
		}
	} else {
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div');
		status.className = 'status';
		status.appendChild(document.createTextNode(packet.status));
		line.appendChild(status);

		if('progress' in packet){
			var progress = document.createElement('progress');
			progress.value = packet.progress;
			progress.max = 1;
			line.appendChild(progress);
		}

		if(packet.status == 'done'){
			var pre = document.createElement('pre');
			pre.appendChild(document.createTextNode(packet.data.text));
			pre.style.border = '1px solid black'
			
			var a = document.createElement('a');
			a.href = packet.data.text;

			line.innerHTML = '';
			a.appendChild(pre);
			line.appendChild(a);
		}

		output_text.insertBefore(line, output_text.firstChild);
	}
}
*/