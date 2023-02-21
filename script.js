
function isInRect (x, y, rect) {
    if (x === undefined || y === undefined
            || rect.ax === undefined || rect.ay === undefined
            || rect.bx === undefined || rect.by === undefined)
        return (false)
    if (rect.ax > rect.bx) {
        var tmp = rect.ax
        rect.ax = rect.bx
        rect.bx = tmp
    }
    if (rect.ay > rect.by) {
        var tmp = rect.ay
        rect.ay = rect.by
        rect.by = tmp
    }
    if (x > rect.ax && x < rect.bx 
            && y > rect.ay && y < rect.by)
        return (true)
    return (false)
}

function testCB (block) {
    if (!block)
        console.log("error, no block")
    console.log("change block " + block.x + " " + block.y)
    map_test.mapBlock[block.x][block.y] = (map_test.mapBlock[block.x][block.y] + 1) % 4
    scale_changed = true
}

function getAngleFromTime (angleMin, angleMax, t) {
    var angleArc = angleMax - angleMin
    return (angleMin + angleArc / 2 + t * angleArc / 2)
}

function distBlock (ax, ay, bx, by) {
    var dist = Math.abs(ax - bx)
    var dist2 = Math.abs(ay - by)
    if (dist > dist2)
        return dist
    return dist2
}

function distBlockNoDiagonal (ax, ay, bx, by) {
    var dist = Math.abs(ax - bx)
    var dist2 = Math.abs(ay - by)
    return dist + dist2
}

function dist (ax, ay, bx, by) {
    var dist = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by))
    return dist

}




/*

        var zone = []
        var p = world.players.Playerturn
        var px = p.x + p.size / 2
        var py = p.y + p.size / 2
        var rmin = 2 + p.size / 2
        var rmax = 5 + p.size / 2
        
        for (var i = p.x - Math.round(rmax); i < p.x + p.size + Math.round(rmax); i++)
            for (var j = p.y - Math.round(rmax); j < p.y + p.size + Math.round(rmax); j++)
                if (world.map.mapBlock[i] && world.map.mapBlock[i][j] && p.getDistToABlock({block : world.map.mapBlock[i][j]}) <= Math.round(rmax) && p.getDistToABlock({block : world.map.mapBlock[i][j]}) >= rmin)
                    console.log([i, j, p.getDistToABlock({block : world.map.mapBlock[i][j]})])

*/




Connection = function () {

    
    this.ws

    this.sendMsg = (msg) => {
        if (this.ws && this.ws.readyState == 1)
            this.ws.send(msg)
    }
    this.createConnection = () => {
        var ip = "13ab-35-180-11-190.ngrok.io"
        var port = "8080"

        this.ws = new WebSocket('wss://' + ip)// + ":" + port)
        this.ws.binaryType = "arraybuffer";
        this.ws.addEventListener('open', function (event) {
            console.log("connected")
            console.log("cb " + this.callbackConnect)
            world.onConnectionCreated()
            world.Connection.sendMsg(JSON.stringify([0, world.userName, world.password]))
            //this.sendMsg(JSON.stringify('Hello Server!'));
          });
        
          this.ws.addEventListener('message', function (event) {
            console.log("message from server : " + event.data)
            world.HandleMessage(JSON.parse(event.data))
        });
        
        this.ws.addEventListener('error', function (event) {
            console.log("error : " + event)
        });

        this.ws.addEventListener('close', function (event) {
            world.onConnectionClosed()
            console.log("conenction closed")
        });
    }

    this.closeConnection = () => {
        this.ws.close()
    }
 
}
SoundManager = function () {

    this.sounds = []
    this.src = "./music/"

    this.LoadSound = (name) => {
        if (this.sounds[name] && this.sounds[name].readyState)
            return
        var sound = new Audio(this.src + name + ".mp3")
        this.sounds[name] = sound
    }

    this.playSound = (name, loop, Norestart) => {
        if (!this.sounds[name])
            this.LoadSound(name)
        if (!Norestart && !this.sounds[name].paused)
            this.sounds[name].currentTime = 0;
        if (loop)
            this.sounds[name].loop = true
        this.sounds[name].play()
    }

    this.stopSound = (name) => {
        if (this.sounds[name]) {
            this.sounds[name].pause()
            this.sounds[name].currentTime = 0;
        }
    }
}
myImage = function (name, src) {
    console.log("creating an image : " + src)
    this.img = new Image(); // Image constructor
    this.ready = false
    this.name = name
    this.img.crossOrigin = 'anonymous'
    this.img.src = src;
    this.img.alt = 'cant load image "' + src + '"';
    this.imgColored = undefined
    this.colorColored = undefined
    //this.img.crossOrigin = 'anonymous';
    this.img.decode()
    .then(() => {
        console.log("img " + name + " is loaded")
        this.ready = true
        this.AlphaTransparencyByPixel(255, 255, 255)


        if (world.villageUI)
            world.villageUI.needRedraw = true
        if (world.GameUI)
            world.GameUI.needRedraw = true

    })
    .catch((encodingError) => {
        console.log("can't load " + this.name)
        console.log(encodingError)
    })

    this.createDatafromImage = () => {
        if (!this.ready)
            return undefined
        const canvas = document.createElement("canvas")// new OffscreenCanvas(this.img.width, this.img.height)
        canvas.width = this.img.width
        canvas.height = this.img.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(this.img, 0, 0)
        return ctx.getImageData(0, 0, this.img.width, this.img.height)
    }

    this.createImgFromData = (data) => {
        const canvas = document.createElement("canvas")// new OffscreenCanvas(this.img.width, this.img.height)
        canvas.width = data.width
        canvas.height = data.height
        //const canvas = new OffscreenCanvas(data.width, data.height)
        const ctx = canvas.getContext("2d")
        ctx.putImageData(data, 0, 0)
        this.img = new Image()
        this.img.src = canvas.toDataURL()
        this.img.alt = 'failed createImgData image';
        this.img.decode().then(() => {
            if (world.villageUI)
                world.villageUI.needRedraw = true
            if (world.GameUI)
                world.GameUI.needRedraw = true
        })
    }

    this.GetColorImage = (src_r, src_g, src_b, dst_r, dst_g, dst_b) => {
        var imageData = this.createDatafromImage()
        if (!imageData)
            return console.log("can't create getColorImage")
        for(var x = 0; x < imageData.height; x++) {
            for(var y = 0; y < imageData.width; y++) {
                var r = imageData.data[((x*(imageData.width*4)) + (y*4))];
                var g = imageData.data[((x*(imageData.width*4)) + (y*4)) + 1];
                var b = imageData.data[((x*(imageData.width*4)) + (y*4)) + 2];
                var a = imageData.data[((x*(imageData.width*4)) + (y*4)) + 3];
                if (r == src_r && g == src_g && b == src_b) {
                    imageData.data[((x*(imageData.width*4)) + (y*4))] = dst_r
                    imageData.data[((x*(imageData.width*4)) + (y*4)) + 1] = dst_g;
                    imageData.data[((x*(imageData.width*4)) + (y*4)) + 2] = dst_b;
                }
            }
        }
        const canvas = document.createElement("canvas")// new OffscreenCanvas(this.img.width, this.img.height)
        canvas.width = imageData.width
        canvas.height = imageData.height
        //const canvas = new OffscreenCanvas(data.width, data.height)
        const ctx = canvas.getContext("2d")
        ctx.putImageData(imageData, 0, 0)
        var imgColored = new Image()
        imgColored.src = canvas.toDataURL()
        imgColored.alt = 'failed createImgData image Colored';
        
        return imgColored
    }

    this.AlphaTransparencyByPixel = (ra, ga, ba) => {
        var imageData = this.createDatafromImage()
        if (!imageData)
            return undefined
        for(var x = 0; x < imageData.height; x++) {
            for(var y = 0; y < imageData.width; y++) {
                var r = imageData.data[((x*(imageData.width*4)) + (y*4))];
                var g = imageData.data[((x*(imageData.width*4)) + (y*4)) + 1];
                var b = imageData.data[((x*(imageData.width*4)) + (y*4)) + 2];
                var a = imageData.data[((x*(imageData.width*4)) + (y*4)) + 3];
                if (r == ra && g == ga && b == ba) {
                    imageData.data[((x*(imageData.width*4)) + (y*4)) + 3] = 0
                }
            }
        }
        this.createImgFromData(imageData);
    }    
}



createImgFromData = (data) => {
    const canvas = document.createElement("canvas")// new OffscreenCanvas(this.img.width, this.img.height)
    canvas.width = data.width
    canvas.height = data.height
    //const canvas = new OffscreenCanvas(data.width, data.height)
    const ctx = canvas.getContext("2d")
    ctx.putImageData(data, 0, 0)
    var img = new Image()
    img.src = canvas.toDataURL()
    img.alt = 'failed createImgData image'
    return img
}


MyUI = function (canvas, x, y, lenx, scale, background, stroke, marge) {

    MYUI_WINDOWINFO_MOUSETIME = 400
    MYUI_LETTER_SIZE = 20
    MYUI_FONT = "'Footlight MT Light'"

    this.x = x
    this.y = y
    this.canvas = canvas
    this.marge = marge ? marge : 5
    this.lenx = lenx + 2 * this.marge
    this.leny = this.marge
    this.elmList = []
    this.scale = scale
    this.background = background ? background : undefined
    this.stroke = stroke ? stroke : undefined
    this.buttonList = []
    this.windowInfoColor = "#000000"
    

    this.InfoWindowPos = false


    this.addTextZone = (txt, letter_size, letter_per_line, text_color, text_font) => {
        this.canvas.ctx.font = "" + letter_size + "px" + text_font
        var txts = []
        while (txt.length > 0) {
            var cutlen = 0
            while (txt[cutlen] == '\n')
                cutlen++
            while (txt[cutlen] != '\n' && cutlen < txt.length && cutlen < letter_per_line)
                cutlen++;
            if (cutlen == letter_per_line)
                while (txt[cutlen] != ' ' && cutlen > 0)
                    cutlen--
            cutlen = cutlen > 0 ? cutlen : letter_per_line
            var line = "" + txt.substring(0, cutlen)
            while (txt[cutlen + 1] == '\n')
                cutlen++
            txt = txt.substring(cutlen)
            txts.push(line)
            var txt_size = this.canvas.ctx.measureText(line)
            if (this.lenx < txt_size.width + 2 * this.marge)
                this.lenx = txt_size.width + 2 * this.marge
            this.leny += (letter_size + this.marge) 
        }
        this.elmList.push({
            type : "text",
            txts : txts,
            letter_size : Math.floor(letter_size),
            txt_color : text_color,
            text_font : text_font
        })
    }

    this.addGauge = (txt, fullness, lenx, leny, letter_size, colorFill, colorStroke, colorText, text_font) => {
        text_font = text_font ? text_font : "Arial"
        this.canvas.ctx.font = "" + letter_size + "px " + text_font
        var txt_size = this.canvas.ctx.measureText(txt)
        if (txt_size > lenx + 2 * this.marge)
            lenx = txt_size + 2 * this.marge
        if (this.lenx < lenx + 2 * this.marge)
            this.lenx = lenx + 2 * this.marge
        if (leny < letter_size + 2 * this.marge)
            leny = letter_size + 2 * this.marge
        this.elmList.push({
            type : "gauge",
            txt : txt,
            fullness : fullness,
            lenx : lenx,
            leny : leny,
            letter_size : letter_size,
            colorFill : colorFill,
            colorStroke : colorStroke,
            colorText : colorText,
            text_font : text_font,
        })
        this.leny += leny + this.marge
    }

    this.addButton = (txt, letter_size, text_color, fillColor, strokeColor, callback, callback_data, text_font, key_event, windowInfo, mouseLight) => {
        this.canvas.ctx.font = "" + letter_size + "px" + text_font
        txt = key_event ? key_event + " - " + txt : txt
        var txt_size = this.canvas.ctx.measureText(txt)
        if (txt_size.width + 4 * this.marge > this.lenx)
            this.lenx = txt_size.width + 4 * this.marge
        this.elmList.push({
            type : "button",
            txt_size : txt_size,
            letter_size : letter_size,
            text_color : text_color,
            fillColor : fillColor,
            strokeColor : strokeColor,
            callback : callback,
            callback_data : callback_data,
            text_font : text_font,
            key_event : key_event,
            txt : txt,
            windowInfo : windowInfo,
            mouseLight : mouseLight
        })
        this.leny += Math.floor(3 * this.marge + letter_size)
    }

    this.addHorizontalElem = (list) => {
        // list  all the elemnt on the verctial
        var elmUI = {
            type : "horizontal",
            list : []
        }
        var max_len_y = 0;
        var len_x = this.marge
        for (var z in list) {
            var e = list[z]
            var elmHoriz = undefined
            switch (e.type) {
                case undefined :
                    continue
                case "txt" :
                    if (!e.txt)
                        continue
                    var txt = e.txt
                    var txts = []
                    var txt_leny = 0
                    var txt_lenx = 0
                    var letter_per_line = e.letter_per_line ? e.letter_per_line : 9999
                    this.canvas.ctx.font = "" + e.letter_size + "px" + e.txt_font
                    while (txt.length > 0) {
                        var cutlen = 0
                        while (txt[cutlen] == '\n')
                            cutlen++
                        while (txt[cutlen] != '\n' && cutlen < txt.length && cutlen < letter_per_line)
                            cutlen++;
                        if (cutlen == letter_per_line)
                            while (txt[cutlen] != ' ' && cutlen > 0)
                                cutlen--
                        cutlen = cutlen > 0 ? cutlen : letter_per_line
                        var line = "" + txt.substring(0, cutlen)
                        while (txt[cutlen + 1] == '\n')
                            cutlen++
                        txt = txt.substring(cutlen)
                        txts.push(line)
                        var txt_size = this.canvas.ctx.measureText(line)
                        if (txt_lenx < txt_size.width + 2 * this.marge)
                            txt_lenx = txt_size.width + 2 * this.marge
                        txt_leny += (e.letter_size + this.marge) 
                    }
                    max_len_y = txt_leny > max_len_y ? txt_leny : max_len_y  
                    elmHoriz = {
                        type : "txt",
                        txts : txts,
                        txt_color : e.txt_color ? e.txt_color : "#000000",
                        max_letters : e.max_letter ? e.max_letter : 9999,
                        letter_size : e.letter_size ? e.letter_size : 20,
                        txt_font : e.txt_font ? e.txt_font : "Arial",
                        txt_size : txt_lenx,
                    }
                    
                    len_x += txt_lenx
                    //
                    //var txt_size = this.canvas.ctx.measureText(elmHoriz.txt).width
                    //elmHoriz.txt_size = txt_size
                    //max_len_y = elmHoriz.letter_size > max_len_y ? elmHoriz.letter_size : max_len_y
                    //len_x += elmHoriz.txt_size + this.marge
                    break
            
                case "img" :
                    if (!e.img)
                        continue
                    elmHoriz = {
                        type : "img",
                        img : e.img,
                        len_x : e.len_x ? e.len_x : 50,
                        len_y : e.len_y ? e.len_y : 50
                    }
                    max_len_y = elmHoriz.len_y > max_len_y ? elmHoriz.len_y : max_len_y
                    len_x += elmHoriz.len_x + this.marge
                    break
                case "button" :
                    if (!e.callback || !e.txt)
                        continue
                    var letter_size = e.letter_size ? e.letter_size : 20
                    var txt_font = e.txt_font? e.txt_font : "Arial"
                    this.canvas.ctx.font = "" + letter_size + "px" + txt_font
                    var txt = e.key_event ? e.key_event + " - " + e.txt : e.txt
                    var txt_size = this.canvas.ctx.measureText(txt)
                    elmHoriz = {
                        type : "button",
                        txt_size : txt_size.width,
                        letter_size : letter_size,
                        txt_color : e.txt_color ? e.txt_color : '#000000',
                        fillColor : e.fillColor ? e.fillColor : "#ffffff",
                        strokeColor : e.strokeColor ? e.strokeColor : '#000000',
                        callback : e.callback,
                        callback_data : e.callback_data,
                        txt_font : txt_font,
                        key_event : e.key_event,
                        txt : txt,
                        windowInfo: e.windowInfo,
                        mouseLight : e.mouseLight
                    }
                    max_len_y = elmHoriz.letter_size + 2 * this.marge > max_len_y ? elmHoriz.letter_size + 2 * this.marge : max_len_y
                    len_x += txt_size.width + this.marge * 3
                    break
            }
            elmUI.list.push(elmHoriz)
        }
        if (this.lenx < len_x)
            this.lenx = len_x
        elmUI.len_y = max_len_y
        this.elmList.push(elmUI)
        this.leny += Math.floor(this.marge + max_len_y)
    }

    this.addImage = (img, lenx, leny) => {
        this.elmList.push({
            type : "img",
            img : img,
            lenx : lenx,
            leny : leny
        })
        if (this.lenx < lenx + 2 * this.marge)
            this.lenx = lenx + 2 * this.marge
        this.leny += Math.floor(this.marge + lenx)
    }

    this.drawUI = () => {
        if (this.background) {
            this.canvas.ctx.fillStyle = this.background
            this.canvas.drawFillRect(this.x, this.y, this.x + this.lenx, this.y + this.leny)
        }
        if (this.stroke) {
            this.canvas.ctx.strokeStyle = this.stroke
            this.canvas.drawRect(this.x, this.y, this.x + this.lenx, this.y + this.leny)
        }
        var py = this.y + this.marge
        for (var z in this.elmList) {
            var zone = this.elmList[z]
            switch (zone.type) {
                case "text": 
                    for (var i in zone.txts) {
                        this.canvas.drawTextTopLeft(zone.txts[i], this.x + this.marge, py, this.lenx, zone.letter_size, zone.txt_color, zone.text_font)
                        py += zone.letter_size + this.marge
                    }
                    break
                case "button":
                    this.canvas.ctx.font = "" + zone.letter_size + "px" + zone.text_font
                    var center_x = Math.floor(this.x + zone.txt_size.width / 2 + 2 * this.marge)
                    var center_y = Math.floor(py + zone.letter_size / 2 + 1 * this.marge)
                    var bRect = {
                        ax : Math.floor(center_x - zone.txt_size.width / 2 - this.marge),
                        ay : Math.floor(center_y - zone.letter_size / 2 - this.marge),
                        bx : Math.floor(center_x + zone.txt_size.width / 2 + this.marge),
                        by : Math.floor(center_y + zone.letter_size / 2 + this.marge),
                    }
                    this.canvas.ctx.fillStyle = zone.fillColor
                    if (zone.mouseLight && world.Controler.mousePos && world.Controler.mousePos.x !== undefined && isInRect(world.Controler.mousePos.x, world.Controler.mousePos.y, bRect))
                        this.canvas.ctx.fillStyle = zone.fillColor.substring(0, 7) + zone.mouseLight
                    this.canvas.drawFillRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                    this.canvas.ctx.strokeStyle = zone.strokeColor
                    this.canvas.drawRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                    this.canvas.drawTextCenter(zone.txt, center_x, center_y, 9999, zone.letter_size, zone.text_color, zone.text_font)
                    this.buttonList.push({
                        rect : bRect,
                        callback : zone.callback,
                        callback_data : zone.callback_data,
                        key_event : zone.key_event,
                        windowInfo : zone.windowInfo
                    })
                    py += zone.letter_size + this.marge * 3
                    break;
                case ("img"):
                    this.canvas.draw_Image(zone.img, this.x + this.marge, py + this.marge, zone.lenx, zone.leny)
                    py += zone.leny + this.marge
                    break
                case ("gauge"):
                    this.canvas.ctx.fillStyle = zone.colorFill
                    this.canvas.drawFillRect(this.x + this.marge, py + this.marge, this.x + zone.lenx, py + zone.leny)
                    this.canvas.ctx.fillStyle = zone.colorStroke
                    if (zone.fullness > 0)
                        this.canvas.drawFillRect(this.x + this.marge * 2, py + this.marge * 2, Math.floor(this.x + zone.lenx * zone.fullness - this.marge), py + zone.leny - this.marge)
                    this.canvas.drawTextCenter(zone.txt, this.x + this.marge + zone.lenx / 2, py + this.marge + zone.leny / 2, zone.lenx, zone.letter_size, zone.colorText, zone.text_font)
                    py += zone.leny
                    break
                case ("horizontal"):
                    var horizX = this.marge
                    for (var e in zone.list) {
                        var elmH = zone.list[e]
                        switch (elmH.type) {
                            case "txt": 
                                var ppy = py
                                for (var z in elmH.txts) {
                                    this.canvas.drawTextTopLeft(elmH.txts[z], this.x + horizX, ppy, elmH.txt_size, elmH.letter_size, elmH.txt_color, elmH.txt_font)
                                    ppy += elmH.letter_size + this.marge
                                }
                                horizX += this.marge + elmH.txt_size
                                break
                            case "button":
                                this.canvas.ctx.font = "" + elmH.letter_size + "px" + elmH.txt_font
                                var center_x = Math.floor(this.x + horizX + elmH.txt_size / 2 + this.marge / 2)
                                var center_y = Math.floor(py + elmH.letter_size / 2 + this.marge / 2)
                                var bRect = {
                                    ax : Math.floor(center_x - elmH.txt_size / 2 - this.marge),
                                    ay : Math.floor(center_y - elmH.letter_size / 2 - this.marge),
                                    bx : Math.floor(center_x + elmH.txt_size / 2 + this.marge),
                                    by : Math.floor(center_y + elmH.letter_size / 2 + this.marge),
                                }
                                this.canvas.ctx.fillStyle = elmH.fillColor
                                if (elmH.mouseLight && world.Controler.mousePos && world.Controler.mousePos.x !== undefined && isInRect(world.Controler.mousePos.x, world.Controler.mousePos.y, bRect))
                                    this.canvas.ctx.fillStyle = elmH.fillColor.substring(0, 7) + elmH.mouseLight
                                this.canvas.drawFillRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                                this.canvas.ctx.strokeStyle = elmH.strokeColor
                                this.canvas.drawRect(bRect.ax, bRect.ay, bRect.bx, bRect.by)
                                this.canvas.drawTextCenter(elmH.txt, center_x, center_y, 9999, elmH.letter_size, elmH.txt_color, elmH.txt_font)
                                this.buttonList.push({
                                    rect : bRect,
                                    callback : elmH.callback,
                                    callback_data : elmH.callback_data,
                                    key_event : elmH.key_event,
                                    windowInfo : elmH.windowInfo,
                                    mouseLight : true
                                })
                                horizX += this.marge * 3 + elmH.txt_size
                                break;
                            case ("img"):
                                this.canvas.draw_Image(elmH.img, this.x + horizX, py, elmH.len_x, elmH.len_y)
                                horizX += elmH.len_y + this.marge
                                break
                        } 
                    }
                    py += zone.len_y + this.marge
                    break
            }
        }
        this.CheckInfoWindow()
    }
    this.click_buton_check = (x, y) => {
        for (var z in this.buttonList) {
            var buto = this.buttonList[z]
            if (isInRect(x, y, buto.rect)) {
                buto.callback(buto.callback_data)
                return (true)
            }
        }
        return (false)
    }

    this.mouse_move_check = (x, y) => {
        for (var z in this.buttonList) {
            var buto = this.buttonList[z]
            if (buto.mouseLight && isInRect(x, y, buto.rect)) {
                this.needRedraw = true
                return (true)
            }
        }
        return (false)
    }

    this.key_buton_check = (key) => {
        for (var z in this.buttonList) {
            var buto = this.buttonList[z]
            if (buto.key_event && buto.key_event == key) {
                buto.callback(buto.callback_data)
                return (true)
            }
        }
        return (false)
    }
    this.CheckInfoWindow = (redraw) => {
        if (!world.Controler)
            return false
        var mpos = world.Controler.mousePos
        if (!mpos)
            return
        if (new Date().getTime() - mpos.lastTime < MYUI_WINDOWINFO_MOUSETIME) {
            if (this.InfoWindowPos) {
                this.InfoWindowPos = false
                this.needRedraw = true;
            }
            return false
        }
        if (!this.InfoWindowPos)
            this.InfoWindowPos = {
                x : mpos.x,
                y : mpos.y
            }
        else if (!redraw && mpos.x == this.InfoWindowPos.x && mpos.y == this.InfoWindowPos.y)
            return false

        for (var z in this.buttonList) {
            var b = this.buttonList[z]
            if (b.windowInfo && isInRect(mpos.x, mpos.y, b.rect)) {
                var wUI = new MyUI(this.canvas, mpos.x, mpos.y, 50, 1, this.background, this.stroke, 1)
                wUI.addTextZone("  Info  ", MYUI_LETTER_SIZE, 9999, '#000000', MYUI_FONT)
                for (var i in b.windowInfo) {
                    var e = b.windowInfo[i]
                    if (e.callback)
                        wUI.addTextZone(e.callback(e.input), MYUI_LETTER_SIZE, 9999, this.windowInfoColor, MYUI_FONT)
                }
                wUI.drawUI()
                return true
            }
        }
        return false
    }

}

UIManager = function () {
    this.UI_list = []

    this.createUI = (canvas, x, y, lenx, scale, background, stroke, marge) => {
        var UI = new MyUI(canvas, x, y, lenx, scale, background, stroke, marge)
        this.UI_list.push(UI)
        return UI
    }

    this.Key_Input = (key) => {
        for (var z in this.UI_list) {
            var UI = this.UI_list[z]
            var check = UI.key_buton_check(key)
            if (check)
                return (true)
        }
        return (false)
    }

    this.Mouse_Input = (x, y) => {
        for (var z in this.UI_list) {
            var UI = this.UI_list[z]
            var check = UI.click_buton_check(x, y)
            if (check)
                return (true)
        }
        return (false)
    }
}
MyCanvas = function(id, layer, info) {
        /*
        create a canvas
        option info : default is screen size, else info.x and info.y
        */
       
        this.width = window.innerWidth
        this.height = window.innerHeight


        if (info) {
            if (info.x && info.y) {
                this.width = info.x
                this.height = info.y
            }
        }
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.id = id
        this.canvas.id = id
        this.canvas.style.zIndex = layer
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px"
        this.ctx = this.canvas.getContext("2d")
        this.fullScreen = false;
        document.body.appendChild(this.canvas)
        
        this.GetCanvasPos = () => {     //get the positon of the canvas relative to the screen
            var pos = this.canvas.getBoundingClientRect()
            if (pos) {
                this.screenAx = Math.floor(pos.x)
                this.screenAy = Math.floor(pos.y)
                this.screenBx = Math.floor(pos.right - pos.x)
                this.screenBy = Math.floor(pos.bottom - pos.y)
            }
            else
                console.log("can't get can pos")
        }
        this.GetCanvasPos();        //first time you create it, get the pos


        this.getPixelPosition = (x, y) => {     //get the pixel position relative to the canvas
            this.GetCanvasPos()
            if (x < this.screenAx || y < this.screenAy || x > this.screenBx || y > this.screenBy)
                return undefined
            var pos = {
                x : Math.floor(x - this.screenAx),
                y : Math.floor(y - this.screenAy)
            }
            return pos
        }


        // TOOL BOX FOR DRAW

        this.cleanCanvas = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

        this.drawFillRect = (startx, starty, endx, endy) => {
            this.ctx.fillRect(startx, starty, endx - startx, endy - starty)
        }
        
        this.drawRect = (startx, starty, endx, endy) => {
            this.ctx.strokeRect(startx, starty, endx - startx, endy - starty)
        }
        
        this.drawLine = (startx, starty, endx, endy) => {
            this.ctx.beginPath();
            this.ctx.moveTo(startx, starty);
            this.ctx.lineTo(endx, endy);
            this.ctx.stroke();
        }
        
        this.draw_Image = (image, x, y, lenx, leny) => {
            x = Math.round(x)
            y = Math.round(y)
            lenx = Math.round(lenx)
            leny = Math.round(leny)
            ctx = this.ctx
            //ctx.setTransform(scale, 0, 0, scale, 0, 0); // sets scale and origin
            ctx.drawImage(image, x, y, lenx, leny);
            //ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        this.drawImageMirrorRotateCenter = (image, x, y, cx, cy, scale, rotation) => {
            x = Math.round(x)
            y = Math.round(y)
            ctx = this.ctx
            ctx.setTransform(-scale, 0, 0, scale, x, y); // sets scale and origin
            ctx.rotate(rotation);
            ctx.drawImage(image, -cx, -cy);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default transform
        }

        this.drawImageRotateCenter = (image, x, y, cx, cy, scale, rotation) => {
            x = Math.round(x)
            y = Math.round(y)
            ctx = this.ctx
            ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
            ctx.rotate(rotation);
            ctx.drawImage(image, -cx, -cy);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default transform
        } 

        this.drawImageRotate = (image, x, y, scale, rotation) => {
            x = Math.round(x)
            y = Math.round(y)
            ctx = this.ctx
            ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
            ctx.rotate(rotation);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default transform
        }

        this.drawTextTopLeft = (txt, x, y, lenx, letter_size, txt_color, font) => {
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = "top"
            this.ctx.fillStyle = txt_color
            var fonttxt = "" + letter_size + "px"
            if (!font)
                font = "serif"
            fonttxt = fonttxt + " " + font
            this.ctx.font = fonttxt
            this.ctx.fillText(txt, x, y, lenx)
        }
        this.drawTextCenter = (txt, x, y, lenx, letter_size, txt_color, font) => {
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = "middle"
            this.ctx.fillStyle = txt_color
            var fonttxt = "" + letter_size + "px"
            if (!font)
                font = "serif"
            fonttxt = fonttxt + " " + font
            this.ctx.font = fonttxt
            this.ctx.fillText(txt, x, y, lenx)
        }
}

CanvasManager = function() {

    this.canList = []
    this.layerLen = 0

    window.addEventListener('resize', () => {
        for (var z in this.canList) {
            var can = this.canList[z].canvas
            can.width = window.innerWidth
            can.height = window.innerHeight
        }
        console.log("resized")
        world.itNeedRedraw()
    })


    document.addEventListener('fullscreenchange', this.EventcloseFullscreen, false);
    document.addEventListener('mozfullscreenchange', this.EventcloseFullscreen, false);
    document.addEventListener('MSFullscreenChange', this.EventcloseFullscreen, false);
    document.addEventListener('webkitfullscreenchange', this.EventcloseFullscreen, false);

    this.EventcloseFullscreen = () => {
        this.fullScreen = false
        this.closeFullscreen()
    }

    this.addCanvas = (id, layer, info) => {
        for (var z in this.canList)
            if (this.canList[z].id == id)
                return console.log("ERROR : CANVAS WITH THIS NAME ALREADY EXIST")
        var canvas = new MyCanvas(id, layer, info)
        this.canList[id] = canvas
    }

    this.openFullscreen = () => {
        this.fullScreen = true;
        document.documentElement.requestFullscreen()
    }
    this.closeFullscreen = () => {
        if (this.fullScreen && document.fullscreenElement) {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                  document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                  document.msExitFullscreen();
                }
        }
//            document.exitFullscreen()
        this.fullScreen = false;
    }

}


var IMG_TO_LOAD = [
    //["player_test3/village/resource", "food_icon"],
]


World = function () {

    BATTLE_CHOICE_FAIL = -1
    BATTLE_CHOICE_RELOAD = 0
    BATTLE_CHOICE_SHOOT = 1
    BATTLE_CHOICE_DEF = 2


    this.Music
    this.Controler
    this.Imgs
    this.Screen

    this.Connection
    this.userName = "guest"
    this.password
    this.state = WORLD_STATE_INIT
    this.serverState
    this.errorFromServer

    this.userList

    this.battle

    this.init = () => {
        this.Screen = new CanvasManager()
        this.Screen.addCanvas("main", 0)
        this.Music = new SoundManager()
        this.Controler = new ControlManager()
        this.loadImg()
        this.MenuUI = new MenuUI()
    }

    this.loadImg = () => {
        this.Imgs = []
        for (var z in IMG_TO_LOAD) {
            var name = IMG_TO_LOAD[z][1]
            var src = IMG_TO_LOAD[z][0]
            this.Imgs[name] = new myImage(name, "./img/" + src + "/" + name + ".png")
        }
    }

    this.changeName = () => {
        var newName = prompt("Enter your nickname [4-16] length", this.userName)
        if (!newName || newName.length < 4 || newName.length > 16)
            return
        this.userName = newName;
    }

    this.itNeedRedraw = () => {
        if (this.MenuUI)
            this.MenuUI.needRedraw = true
    }

    this.onConnectionCreated = () => {
        this.state = WORLD_STATE_SUCESS_CONNECT
        this.itNeedRedraw()
    }

    this.onConnectionClosed = () => {
        this.state = WORLD_STATE_INIT
        this.battle = undefined
        this.userList = undefined
        this.itNeedRedraw()
    }

    this.endConnection = () => {
        this.Connection.closeConnection()
    }

    this.connectToServer = () => {
        this.Connection = new Connection({})
        this.Connection.createConnection()
        this.state = WORLD_STATE_CONNECTING
    }

    this.enterPassword = () => {
        var pass = prompt("Enter your password - [4-16] length")
        if (!pass || pass.length < 4 || pass.length > 16)
            return alert("invalid password, must be between 4 and 16 letters")
        this.password = pass
    }

    this.HandleMessage = (msg) => {
        switch (msg[0]) {
            case 0 :
                this.errorFromServer = msg[1]
                break
            case 1 :
                this.LoadListUsers(msg)
                break
            case 2 : 
                this.SetUser(msg)
                break
            case 3 :
                this.removeUser(msg)
                break
            case 4 :
                this.initBattle(msg)
                break
            case 5 :
                this.updateBattle(msg)
                break
            case 6 :
                this.endBattle(msg)
                break
            case 7 :
                this.SetUserChoice(msg)
                break
        }
        this.itNeedRedraw()
    }

    this.returnToMenu = () => {
        world.state = WORLD_STATE_MENU
        world.battle = undefined
    }

    this.endBattle = (msg) => {
        this.battle.end = msg[1]
    }

    this.LoadListUsers = (data) => {
        if (this.state == WORLD_STATE_INIT)
            this.state = WORLD_STATE_MENU
        this.userList = []
        for (var i = 1; i < data.length; i++)
            this.userList.push({name : data[i][0], state : data[i][1]})
    }

    this.SetUser = (data) => {
        var name = data[1]
        var state = data[2]
        console.log("set user " + [name, state])
        if (name === this.userName) {
            this.state = state
        }

        this.userList = this.userList.filter(a => a.name !== name)
        this.userList.push({name : name, state : state})
    }

    this.SetUserChoice = (data) => {
        if (this.battle) {
            this.battle.mychoice = data[1]
        }
    }

    this.removeUser = (data) => {
        this.userList = this.userList.filter(a => a.name !== data[1])
    }

    this.askForLookingForAGame = () => {
        this.Connection.sendMsg(JSON.stringify([1]))
    }

    this.initBattle = (data) => {
        this.battle = {
            player1 : {
                name : data[1],
                bullet : 0,
                choice : undefined
            },
            player2 : {
                name : data[2],
                bullet : 0,
                choice : undefined
            },
            logs : []
        }
        this.state = USER_STATE_INGAME
        console.log("init battle between " + [this.battle.player1.name, this.battle.player2.name])
    }

    this.sendChoice = (choice) => {
        console.log("sending choice " + choice)
        this.Connection.sendMsg(JSON.stringify([2, choice]))
    }

    this.updateBattle = (data) => {
        this.battle.mychoice = undefined
        var b = this.battle
        var p1 = data[1]
        var choicep1 = data[2]
        var p2 = data[3]
        var choicep2 = data[4]
        this.battle.logs.push({p1 : p1, p1choice : choicep1, p2 : p2, p2choice : choicep2})
        if (choicep1 == BATTLE_CHOICE_RELOAD)
            b.player1.bullet++
        if (choicep2 == BATTLE_CHOICE_RELOAD)
            b.player2.bullet++
        if (b.player1.bullet == 5 && b.player2.bullet == 5) {
            b.player1.bullet = 0
            b.player2.bullet = 0
        }
        else if (b.player1.bullet == 5)
            b.end = player1.name
        else if (b.player2.bullet == 5)
            b.end = b.player2.name
        if (choicep1 == BATTLE_CHOICE_SHOOT && choicep2 == BATTLE_CHOICE_SHOOT)
            ;
        else if (choicep1 == BATTLE_CHOICE_SHOOT && choicep2 != BATTLE_CHOICE_DEF)
            b.end = b.player1.name
        else if (choicep2 == BATTLE_CHOICE_SHOOT && choicep1 != BATTLE_CHOICE_DEF)
            b.end = b.player2.name
        if (choicep1 == BATTLE_CHOICE_SHOOT)
            b.player1.bullet--
        if (choicep2 == BATTLE_CHOICE_SHOOT)
            b.player2.bullet--
        b.round = b.round ? b.round + 1 : 1
    }

}


WORLD_STATE_INIT = -2
WORLD_STATE_CONNECTING = -1
var id = 1
USER_STATE_CHECKING = id++
WORLD_STATE_SUCESS_CONNECT = USER_STATE_CHECKING
USER_STATE_IDLE = id++
WORLD_STATE_MENU = USER_STATE_IDLE
USER_STATE_LOOKFORAGAME = id++
USER_STATE_INGAME = id++


MenuUI = function () {
    this.mUI
    this.needRedraw = true
    this.canvas = world.Screen.canList["main"]
    this.background = "#000088"
    this.stroke = '#000000'
    this.marge = 1
    this.drawBeforeCenter = false
    
    MENU_FONT = "'Courier New'"

    this.init_check_mouse_move = () => {        //highlight button when mouse move over it
        window.addEventListener('mousemove', (event) => {
            var check = false
            if (this.mUI && this.mUI.mouse_move_check(event.clientX, event.clientY) && !this.mouseWasOnMouseLightLastDraw) {
                this.needRedraw = true
                this.mouseWasOnMouseLightLastDraw = true
                check = true
            }
            if (!check && this.mouseWasOnMouseLightLastDraw) {
                this.mouseWasOnMouseLightLastDraw = false
                this.needRedraw = true
            }
            if (this == world.MenuUI)
                this.init_check_mouse_move()
        }, {once : true});
    }
    this.init_check_mouse_move()

    function GetTextOfChoice (choice) {
        if (choice === BATTLE_CHOICE_RELOAD)
            return ("Reload")
        if (choice === BATTLE_CHOICE_SHOOT)
            return ("Shoot")
        if (choice === BATTLE_CHOICE_DEF)
            return ("Defend")
        return ("Fail")
    }

    this.drawUIMenu = () => {
        if (world.state == WORLD_STATE_INIT) {
            this.mUI.addButton(world.userName, 40, '#000000', "#ffffffff", "#000000", world.changeName, undefined, MENU_FONT, undefined, [{callback : () => {return "change your nickname"}}], "88")
            //this.mUI.addButton("password", 40, '#000000', "#ffffffff", "#000000", world.enterPassword, undefined, MENU_FONT, undefined, [{callback : () => {return "enter password here"}}], "88")
            this.mUI.addButton("Connection", 40, '#000000', "#00ffffff", "#000000", world.connectToServer, undefined, MENU_FONT, undefined, [{callback : () => {return "connect to the server"}}], "88")
            if (world.errorFromServer)
                this.mUI.addTextZone("connection error\n" + world.errorFromServer, 40, 9999, "#ff0000", MENU_FONT)
        }
        else if (world.state == WORLD_STATE_CONNECTING) {
            this.mUI.addTextZone("Connecting...", 40, 9999, "#ffffff", MENU_FONT)
        }
        else if (world.state == WORLD_STATE_SUCESS_CONNECT) {
            this.mUI.addTextZone("You are now connected !!", 40, 9999, "#ffffff", MENU_FONT)
            this.mUI.addButton("disconnect", 40, '#000000', "#00ffffff", "#000000", world.endConnection , undefined, MENU_FONT, undefined, [{callback : () => {return "end connection with the server"}}], "88")
        }
        else if (world.state == WORLD_STATE_MENU || world.state == USER_STATE_LOOKFORAGAME) {
            this.mUI.addButton("disconnect", 40, '#000000', "#00ffffff", "#000000", world.endConnection , undefined, MENU_FONT, undefined, [{callback : () => {return "end connection with the server"}}], "88")
            var butotxt = world.state == WORLD_STATE_MENU ? "start a game" : world.state == USER_STATE_LOOKFORAGAME ? "stop searching" : "???"
            this.mUI.addButton(butotxt, 40, '#000000', "#88ffffff", "#000000", world.askForLookingForAGame , undefined, MENU_FONT, undefined, [{callback : () => {return "search an opponent for play with you"}}], "88")
            this.mUI.addTextZone("players connected : ", 30, 9999, "#ffffff", MENU_FONT)
            for (var z in world.userList) {
                var user = world.userList[z]
                console.log("color : " + user.state)
                var color = user.state == USER_STATE_IDLE ? "#ffffff" : user.state == USER_STATE_LOOKFORAGAME ? "#00ff00" : user.state == USER_STATE_INGAME ? '#ff0000' : "#888888"
                this.mUI.addTextZone(user.name, 20, 9999, color, MENU_FONT)
            }
        }
        else if (world.state == USER_STATE_INGAME) {
            var battle = world.battle
            if (!battle)
                return
            var bullet = ""
            for (var i = 0; i < battle.player1.bullet; i++)
                bullet += "*"
            var txt = bullet + " " + battle.player1.name + "    //VS//    " + battle.player2.name
            var bullet = " "
            for (var i = 0; i < battle.player2.bullet; i++)
                bullet += "*"
            txt += bullet
            this.mUI.addTextZone(txt, 40, 9999, "#ffffff", MENU_FONT)


            if (!battle.end) {
                var serverchoice = battle.mychoice
                console.log(GetTextOfChoice(serverchoice))
                var txt = serverchoice === BATTLE_CHOICE_RELOAD ? "--> Reload <--" : "Reload"
                this.mUI.addButton(txt, 40, '#000000', "#ffd70088", "#000000", world.sendChoice, BATTLE_CHOICE_RELOAD, MENU_FONT, undefined, [{callback : () => {return "get +1 bullet\nif enemy shoot, you die"}}], "ff")
                var txt = serverchoice === BATTLE_CHOICE_SHOOT ? "--> Shoot <--" : "Shoot"
                this.mUI.addButton(txt, 40, '#000000', "#dc143c88", "#000000", world.sendChoice, BATTLE_CHOICE_SHOOT, MENU_FONT, undefined, [{callback : () => {return "use 1 bullet for shoot\nKill enemy if he is reloading"}}], "ff")
                var txt = serverchoice === BATTLE_CHOICE_DEF ? "--> Defend <--" : "Defend"
                this.mUI.addButton(txt, 40, '#000000', "#76ff7a88",  "#000000", world.sendChoice, BATTLE_CHOICE_DEF, MENU_FONT, undefined, [{callback : () => {return "use 1 bullet for shoot\nKill enemy if he is reloading"}}], "ff")
            }
            else {
                this.mUI.addTextZone(battle.end + " win the game", 20, 9999, "#ffffff", MENU_FONT)
                this.mUI.addButton("Leave", 40, '#000000', "#ffd70088", "#000000", world.returnToMenu, undefined, MENU_FONT, undefined, [{callback : () => {return "return to the menu"}}], "ff")
            }
            
            for (var i = battle.logs.length - 1; i >= 0; i--) {
                var log = battle.logs[i]
                var txt = "round " + i + "\n" + log.p1 + " " + GetTextOfChoice(log.p1choice) + "\n" + log.p2 + " " + GetTextOfChoice(log.p2choice)
                this.mUI.addTextZone(txt, 15, 9999, "#ffffff", MENU_FONT)
            }
        }
    }

    this.Draw = () => {
        if (!world || !world.state)
            return
        world.Screen.canList["main"].GetCanvasPos()
        world.Screen.canList["main"].cleanCanvas()
        var puix = -1
        var puiy = -1
        if (this.drawBeforeCenter && this.mUI) {
            this.drawBeforeCenter = false
            puix = Math.round(world.Screen.canList["main"].canvas.width / 2 - this.mUI.lenx / 2)
            puix = puix < 0 ? 0 : puix
            puiy = Math.round(world.Screen.canList["main"].canvas.height / 2 - this.mUI.leny / 2)
            puiy = puiy < 0 ? 0 : puiy
        }
        this.mUI = new MyUI(this.canvas, puix, puiy, 5, 5, this.background, this.stroke, this.marge)
        this.mUI.windowInfoColor = '#ffffff'
        //this.mUI = new MyUI(this.canvas, 0, 0, 5000, 5000, this.background, this.stroke, this.marge)
        this.mUI.addTextZone(world.userName + "007", 80, 9999, "#ffffff", MENU_FONT) 
 
        this.drawUIMenu()


        this.mUI.drawUI()

        this.needRedraw = false
        if (puix == -1 && puiy == -1) {
            this.drawBeforeCenter = true
            this.needRedraw = true
            this.Draw()
        }
    }

    this.needRedraw = () => {
        if (this.MenuUI)
            this.MenuUI.needRedraw = true
    }

    this.CheckInfoWindow = (redraw) => {
        if (this.mUI && this.mUI.CheckInfoWindow(redraw))
            this.needRedraw = true
    }

    this.cancel_menu = () => {
        return false
    }

    this.getMouseInput = (input) => {
        if (!input || input.x === undefined)
            return false
        var x = input.x
        var y = input.y
        if (input.button == 2) { //right click
            var test = this.cancel_menu()
            if (test)
                return true
        }
        else if (this.mUI.click_buton_check(x, y))
            return true
        return false
    }
}
ControlManager = function() {

    this.keyDown = []
    this.keyUp = []
    this.mousePos = {
        x : 0,
        y : 0,
        lastTime : new Date().getTime()
    }

    window.addEventListener('keydown', (event) => {
        if (event.repeat)
            return
        var name = event.key;
        var code = event.code;
        this.keyDown[code] = true
        //console.log("key code : " + code)
    });
    window.addEventListener('keyup', (event) => {
        var name = event.key;
        var code = event.code;
        this.keyDown[code] = false
        this.keyUp[code] = true
    });
    window.addEventListener('wheel', (event) => {
        var wheelDir = event.deltaY
    })
    window.addEventListener('mouseup', (event) => {
        var topc = world.Screen.canList["main"];
        pos = topc.getPixelPosition(event.clientX, event.clientY)
        if (pos) {
            this.inputclick = {
                x : pos.x,
                y : pos.y,
                button : event.button
            }
        }
    });
    window.addEventListener('mousemove', (event) => {
        var topc = world.Screen.canList["main"];
        this.mousePos = topc.getPixelPosition(event.clientX, event.clientY)
        if (this.mousePos)
            this.mousePos.lastTime = new Date().getTime()
    });



    this.CheckControlInput = () => {
        var GameUigetInput = false

        
        //check key up
        if (this.keyUp['KeyF']) {
            if (!world.Screen.fullScreen)
                world.Screen.openFullscreen()
            else
                world.Screen.closeFullscreen(document)
        }
        
        for (var z in this.keyUp) {
            var k = z
            if (!GameUigetInput && k.startsWith("Digit") || k.startsWith("Numpad"))
                k = k.replace("Digit", "").replace("Numpad", "")
        }
        this.keyUp = []


        //check mouse click
        if (this.inputclick) {
            if (!GameUigetInput && world.MenuUI && world.MenuUI.getMouseInput(this.inputclick)) {
                GameUigetInput = true
                if (world.MenuUI)
                    world.MenuUI.needRedraw = true;
            }
        }
        this.inputclick = undefined
  
    }
}
//prevent menu to open when right click pressed
document.oncontextmenu = rightClick;  
function rightClick(clickEvent) {
    clickEvent.preventDefault();
}
GAME_VERSION = "0.0.1"

if (localStorage.length == 0 || localStorage.version != GAME_VERSION) {
    localStorage.clear()
    localStorage.version = GAME_VERSION
}

var world

window.onload = function() {

    world = new World()
    world.init()
    //world.CreateBattleMap()


    var lastTime = new Date().getTime()
    setInterval(() => {
        if (!world || !world.Controler)
            return
        var now = new Date().getTime()
        lastTime = now

        world.Controler.CheckControlInput()

        /*
        if (world.map && world.map.needRedraw) {
            Screen.canList["mapFloor"].GetCanvasPos()
            Screen.canList["mapFloor"].cleanCanvas()
            Screen.canList["mapTopElem"].GetCanvasPos()
            Screen.canList["mapTopElem"].cleanCanvas()
            world.map.set_drawing_map(Screen.canList["mapFloor"].canvas)
            world.map.draw_map(Screen.canList["mapFloor"], Screen.canList["mapTopElem"], Screen.canList["mapUI"])            
        }
        */
        if (world.MenuUI) {
            world.MenuUI.CheckInfoWindow(false)
            if (world.MenuUI.needRedraw || world.MenuUI.mUI.needRedraw) {
                world.MenuUI.Draw()
            }
        }
        
    }, 20);
    
}
