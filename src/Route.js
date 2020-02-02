;(function(){
	module.exports=function(_g){

		var app = _g.app;
		var http = _g.http;
		var io = _g.io;
		var color = _g.color;
		var count = 0;
		var name = _g.name;
		var dateformat = _g.dateformat;

		function socketEventListener(){

			//io event listener
			io.on('connection', function(socket){
			   count = count + 1;
			   console.log(`${count} users connected [${dateformat()}]`);
			   socket.on('chat message', function(msg){
			   console.log(dateformat() + ', message = ' + JSON.stringify(msg));
			   io.emit('chat message', msg);
			  });

			   socket.on('enter',function(name){
			   	console.log(dateformat() + ', entered user : ' + name);
			   	var enterMsg = `${name}님 접속하셨습니다.`;
			   	var msg={
			   		name : "운영자",
			   		color : "#ffffff",
			   		msg : enterMsg
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
					res.render('index.html',{color:color,name:name});
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



