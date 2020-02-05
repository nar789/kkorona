;(function(){
	module.exports=function(_g){

		var app = _g.app;
		var http = _g.http;
		var io = _g.io;
		var color = _g.color;
		var count = 0;
		var name = _g.name;
		var dateformat = _g.dateformat;
		var mysql = _g.mysql;
		var timeago = _g.timeago;
		//debug
		/*
		const db = {
			host     : 'localhost',
			user     : 'root',
			password : 'apmsetup',
			port     : 3306,
			database : 'korona',
		};*/

		//release
		
		const db = {
			host     : 'localhost',
			user     : 'root',
			password : 'l323585@',
			port     : 3306,
			database : 'korona',
		};
		


		function dbqry(qry,callback){
			var conn = mysql.createConnection(db);
			conn.connect();
		  	conn.query(qry, function(err, rows, fields) {
			  if (!err){
				  if(callback != null){
					callback(rows);
				  }
			  }else{
				console.log('db qry fail.' + qry);
			  } 
	  		});
	  		conn.end();
		}


		function insertMsg(msg){
			var name = encodeURIComponent(msg.name);
			var color = msg.color;
			var content = encodeURIComponent(msg.msg);
			const qry = `insert into msg values(null,'${name}','${content}',now(),'${color}')`;
			dbqry(qry);
		}

		function getRecentMsg(callback){
			const qry = `select *,unix_timestamp(write_datetime) as time from msg order by id desc limit 30;`;
			dbqry(qry,(rows)=>{
				var msgs = [];
				for(var i=0;i<rows.length;i++){
					var msg = {};
					msg.name =  decodeURIComponent(rows[i].name);
					msg.msg =  decodeURIComponent(rows[i].msg);
					msg.color = rows[i].color;
					var time = rows[i].time*1000;
					var timeAgoStr = timeago.format(time);
					msg.time = timeAgoStr;
					msgs.push(msg);
				}

				callback(msgs);

			});
		}
		

		function socketEventListener(){

			//io event listener
			io.on('connection', function(socket){
			   count = count + 1;
			   console.log(`${count} users connected [${dateformat()}]`);
			   socket.on('chat message', function(msg){
			   console.log(dateformat() + ', message = ' + JSON.stringify(msg));
			   insertMsg(msg);
			   msg.time = timeago.format(new Date());
			   msg.time = dateformat(new Date(),'HH:MM:ss');
			   io.emit('chat message', msg);
			  });

			   socket.on('enter',function(name){
			   	console.log(dateformat() + ', entered user : ' + name);
			   	var enterMsg = `${name}님 접속하셨습니다.`;
			   	var msg={
			   		name : "운영자",
			   		color : "#000000",
					msg : enterMsg,
					time: dateformat(new Date(),'HH:MM:ss')
					//time : timeago.format(new Date())
				   }
			   	io.emit('chat message', msg);
			   });
			});


			//end io event listener

		}

		function route(){

			socketEventListener();

			app.get('/',function(req,res){
				loginCheckRouteHook(()=>{
					var msgs = getRecentMsg((msgs)=>{
						res.render('index.html',{color:color,name:name,msgs:msgs});
					});
				});
			});


			app.get('/naver369600b9522b96cb0b63b2bc39396558.html',function(req,res){
				res.render('naver369600b9522b96cb0b63b2bc39396558.html',{});
			});

			app.get('/robots.txt',function(req,res){
				res.type('text/plain');
				res.send(`User-agent: Yeti
Allow:/`);
			});

			//1. enetry point
			/*
			app.listen(1131,function(){
			  preLoad();
			  console.log('KKorona Server listen on *:1131');
			});*/
			
			http.listen(1131, function(){
				preLoad();
				console.log('Chat service listen on *:1131');
			});
		}

		function loginCheckRouteHook(doInLoginCheckRouteHook){
			routeHook(()=>{
				return {result:"success"};
			},(params)=>{
				if(params==undefined || params.result==undefined){
					return;
				}
				if(params.result === "success"){
					//to-do-something
					doInLoginCheckRouteHook();
				} else { //in case of not having session, or not login..etc..
					//to-do
				}
				return {result:"success"};
			},(params)=>{
				return 1;
			});
		}

		function routeHook(onPreExecute,doInRoute,onPostExecute){
			var preReturn = onPreExecute();
			var doReturn = doInRoute(preReturn);
			return onPostExecute(doReturn);
		}

		function preLoad(){
			console.log(dateformat());
		}

		var publicReturn = {
			route:route,
		}
		return publicReturn;
	}

})();



