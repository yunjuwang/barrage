var video = document.getElementById('video')
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
canvas.width = video.clientWidth
canvas.height = video.clientHeight
ctx.font = "30px Arial";

var barrages = []

var Barrage = function(comment){
  this.getColor = function(){
    // let colors = ["red", "yellow", "orange", "green", "blue", "purple"]
    let colors = ['#F24B78','#F285B8','#5B9ED9','#A9D9BE','#F2C12E','#F46122','#9B88D7']
    return colors[Math.floor(Math.random()*colors.length)]
  }
  this.getTop = function(){
    return Math.random() * (canvas.height - 80) + 30
  }
  this.sec = comment.sec
  this.duration = comment.duration
  this.text = comment.text
  this.color = this.getColor()
  this.top = this.getTop()
  this.right = 0
  this.width = ctx.measureText(this.text).width
}

var lastTime = -1;
function update() {
    let time = video.currentTime
    if (time != lastTime) {
        //console.log('time: ' + time)
        updateBarrage()
        if(Math.floor(time) != Math.floor(lastTime) &&
        barrages.findIndex(barrage=>barrage.sec==Math.floor(time))==-1){
          loadBarrage(Math.floor(time))
        }
        drawCanvas()
        lastTime = time;
    }
    //wait approximately 16ms and run again
    requestAnimationFrame(update)
}

function updateBarrage(){
  barrages.forEach(barrage=>{
    let to = canvas.width + barrage.width + 3
    let time = video.currentTime
    let startTime = barrage.sec
    let durTime = barrage.duration

    if(time <= startTime) barrage.right = 0
    else if(time >= startTime + durTime) barrage.right = to
    else barrage.right = to * (time - startTime) / durTime
    /*  0 >>>>>>>>> X >>>>>>>> to
        startTime  time   endTime*/
  })
}

function loadBarrage(sec){
  // let sec = Math.floor(video.currentTime)

  //test on local
  $.ajax({
    url: './comments/getBySecond/' + sec + '.json', 
    type: 'get',
    dataType: 'json',
    error: function (xhr) {
      console.log("No comment at " + sec + " sec")
    }, 
    success: function (comment) { 
      if(!$.isEmptyObject(comment)){
        let barrage = new Barrage(comment)
        barrages.push(barrage)
      }
    }
  })

  // $.ajax({
  //   url: './comments/getBySecond', 
  //   type: 'get',
  //   dataType: 'json',
  //   data: { 'sec': sec },
  //   success: function (comment) { 
  //     if(!$.isEmptyObject(comment)){
  //       let barrage = new Barrage(comment)
  //       barrages.push(barrage)
  //     }
  //   }
  // });
}

function drawCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  barrages.forEach(barrage=>{
    ctx.fillStyle = barrage.color
    ctx.fillText(barrage.text, canvas.width - barrage.right, barrage.top)
  })
}

update()

$("#opacity-bar").on("input change", function() {
  $('#canvas').css('opacity', this.value)
});
$("#fontsize-bar").on("input change", function() {
  ctx.font = this.value +"px Arial";
  barrages.forEach(barrage=>{
    barrage.width = ctx.measureText(barrage.text).width
  })
  drawCanvas()
});