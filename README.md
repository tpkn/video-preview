# Video Preview [![npm Package](https://img.shields.io/npm/v/video-previews.svg)](https://www.npmjs.org/package/video-previews)
Make sprite sheets or gif previews of your videos using Node.js

The module creates two types of previews:
 - Horizontal or vertical sprite sheet for css `animation-timing-function: steps(10, end)`
 - Animated gif image



## API

```javascript
await VideoPreview(input_file, output_file, total_frames[, options])
```

### input_file
**Type**: _String_  
Full path to source video file.


### output_file
**Type**: _String_  
Full path to preview file. Pay special attention to the file extension, it is here that the type of preview to be made is determined! 


### total_frames
**Type**: _Number_  
The amount of frames in a preview file. If `= 1`, then would be taken frame from `duration / 2` position


### options.temp_dir
**Type**: _String_  
**Default**: `{INPUT FILE PATH}/temp_{UNIQ ID}/`  
Temporary folder for storing video frames



### options.video_length   
**Type**: _Number_  
**Default**: `true`  
If not set, then `video-length` module would be used to get actual video length. `video-length` module requires [MediaInfo](https://mediaarea.net/en/MediaInfo) binary!



### options.frames_format   
**Type**: _String_  
**Default**: `jpg`  
`png` gives maximum quality, but `jpg` is faster



### options.width   
**Type**: _Number_ | _String_   
Output image width. Read [this article](https://trac.ffmpeg.org/wiki/Scaling) for more info



### options.height   
**Type**: _Number_ | _String_   
Output image height. Read [this article](https://trac.ffmpeg.org/wiki/Scaling) for more info




### options.quality   
**Type**: _Number_  
**Default**: `75`  
For now it works only for gif output format




### options.direction   
**Type**: _String_  
**Default**: `v`  
Frames direction for `jpg` or `png` sprite sheets   

| Key | Value |
| ------ | ------ |
| v | vertical direction |
| h | horizontal direction |



### options.fps   
**Type**: _Number_  
**Default**: `1`  
Gif frame rate


### options.loop   
**Type**: _Boolean_  
**Default**: `true`  
Loop gif




### options.ffmpeg_bin   
**Type**: _String_  
**Default**: `ffmpeg`  
[FFmpeg binary](https://ffmpeg.org/download.html)



### options.mediainfo_bin   
**Type**: _String_  
**Default**: `MediaInfo`  
[MediaInfo binary](https://mediaarea.net/en/MediaInfo)



### options.convert_bin   
**Type**: _String_  
**Default**: `convert`  
[Convert binary](https://ffmpeg.org/download.html)



### options.gifski_bin   
**Type**: _String_  
**Default**: `gifski`  
[Gifski binary](https://gif.ski/)




### options.cleanup   
**Type**: _Boolean_  
**Default**: `false`  
Remove extracted frames from `temp_dir` at the end


### options.silent   
**Type**: _Boolean_  
**Default**: `true`  
Enables logging `stdout` / `stderr` data  




### @output
**Type**: _Object_  
```javascript
{
   file: 'z:\preview.gif'
}
```


## Usage   
```javascript
const VideoPreview = require('video-preview');

let frames = 10;
let input_file = './videos/MONICA BELLUCCI in the Matrix Sequels (HD Movie Scenes).mp4';
let output_file = './videos/preview.gif';

VideoPreview(input_file, output_file, frames, { 

   width: 320,
   quality: 50,
   fps: 1,
   
   cleanup: true,

}).then(result => {
   console.log(result);
}).catch(err => {
   console.log(err);
})
```
