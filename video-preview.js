/*!
 * Video Preview, http://tpkn.me/
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);
const spawn = require('child_process').spawn;
const VideoDuration = require('video-length');

async function VideoPreview(input_file, output_file, total_frames, options = {}){
   if(typeof input_file !== 'string'){
      throw new TypeError('No source file');
   }
   if(typeof output_file !== 'string'){
      throw new TypeError('The output file is not set');
   }
   if(!isFinite(total_frames) && total_frames > 0){
      throw new TypeError('No preview length is not defined');
   }


   let result = {};
   let output_format = path.extname(output_file).substr(1);
   let { 

      video_length,

      width,
      height,

      frames_format = 'jpg',
      direction = 'v',
      loop = true,
      fps = 1,

      temp_dir = path.join(path.parse(input_file).dir, `/temp_${uniqid()}/`),

      convert_bin = 'convert', 
      convert_options = '',

      ffmpeg_bin = 'ffmpeg', 
      mediainfo_bin = 'MediaInfo',
      gifski_bin = 'gifski',

      cleanup = false,
      silent = false,

   } = options;


   // Get video duration if user didn't pass it
   if(typeof video_length !== 'number' && !isFinite(video_length)){
      video_length = await VideoDuration(input_file, { bin: mediainfo_bin });
   }

   // Resize video frame
   let resize = '-vf ';
   let has_width = typeof width !== 'undefined';
   let has_height = typeof height !== 'undefined';
   if(has_width && !has_height){
      resize += `scale=${width}:-1`;
   }else if(!has_width && has_height){
      resize += `scale=-1:${height}`;
   }else if(has_width && has_height){
      resize += `scale=${width}:${height}`;
   }

   // Preview frames direction
   switch(direction){
      case 'v':
      case 'vertical':
         direction = '-append';
         break
      case 'h':
      case 'horizontal':
         direction = '+append';
         break
   }

   // Define preview file path if it's not set
   if(!output_file){
      output_file = `${temp_dir}${path.parse(input_file).name}_preview.${output_format}`;
   }

   // Extend output file name with a few macros
   output_file = macros(output_file, { total_frames, video_length, direction, resize });
   result.file = output_file;

   // Make sure that temporary folder exists
   await ensureDir(temp_dir);

   // Extract frames
   let cmd = [];
   let hhmmss, frame_name;
   let frames_step = Math.floor(video_length / total_frames);

   for(let i = 1; i < total_frames + 1; i++){
      frame_name = leadingZeros(i);

      if(total_frames == 1){
         hhmmss = HHMMSS(video_length / 2 * 1000);
      }else{
         hhmmss = HHMMSS(frames_step * i * 1000);
      }

      cmd.push(`"${ffmpeg_bin}" -ss ${hhmmss} -i "${input_file}" -y ${resize} -vframes 1 "${temp_dir}${frame_name}.${frames_format}"`);
   }

   // Glue frames together
   switch(output_format){
      case 'jpg':
      case 'jpeg':
      case 'png': 
         cmd.push(`"${convert_bin}" "${temp_dir}*.${output_format}" ${direction} ${convert_options} "${output_file}"`);
      break
      case 'gif':
         let looped = loop ? '' : '--once';
         cmd.push(`"${gifski_bin}" --output "${output_file}" --fps ${fps} --quiet ${looped} ${temp_dir}*.${frames_format}`);
      break
   }

   // Remove temp folder
   if(cleanup){
      cmd.push(`del /f /q ${temp_dir}${path.sep}*.*`);
   }


   return new Promise((resolve, reject) => {
      let child = spawn(cmd.join(' && '), { shell: true });

      child.stdout.on('data', (data) => {
         if(!silent){
            console.log(`${data}`);
         }
      });

      child.stderr.on('data', (data) => {
         if(!silent){
            console.log(`${data}`);
         }
      });

      child.on('exit', (exitCode) => {
         child.stdin.pause();
         child.kill();
         
         if(exitCode == 0){
            resolve(result);
         }else{
            reject('exit code ' + exitCode);
         }
      });

   })
}

function macros(str, options){
   let { total_frames, video_length, direction, resize } = options;
   let macros_list = [
      { key: 'frames', value: total_frames }, 
      { key: 'duration', value: video_length }, 
      { key: 'direction', value: direction }, 
      { key: 'resize', value: resize }
   ]

   for(let i = 0, len = macros_list.length; i < len; i++){
      let m = macros_list[i];
      let rule = new RegExp(`\{\{(\\s+)?${ m.key }(\\s+)?\}\}`, 'g');
      if(rule.test(str)){
         str = str.replace(rule, m.value)
      }
   }

   return str;
}

function HHMMSS(time){
   return new Date(time).toISOString().substr(11, 8);
}

function leadingZeros(num, len = 10) {
   let str = String(num);
   while(str.length < len){
      str = '0' + str;
   }
   return str;
}

async function ensureDir(dir) {
   try {
      await mkdir(dir, { recursive: true })
   }catch(err){
      if (err.code !== 'EEXIST') throw err
   }
}

function uniqid(){
   return (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Date.now()).toString(36).replace('.', '');
}

module.exports = VideoPreview;
