<?php 
//https://manu.ninja/webgl-3d-model-viewer-using-three-js
$pixeler=!isset($_POST['pixeler'])? 'HARUMI' : $_POST['pixeler'];
$title=!isset($_POST['title'])? 'HARUMI' : $_POST['title'];
$subtitle=!isset($_POST['subtitle'])? 'DOMODOMO SERIESE 1' : $_POST['subtitle'];
$dmdmskin=!isset($_GET['dmdmskin'])? 'dmdmskin' : $_GET['dmdmskin'];
$is_img=is_uploaded_file($_FILES['file']['tmp_name']);

if($dmdmskin!='dmdmskin')
{
	$img="../../../data/file/dmdm/".$dmdmskin;
}
else if($is_img) {

	//	파일 업로드 함수
	function file_upload($file, $folder, $allowExt, $file_name)
	{
		$ext = substr(strrchr($file['name'], '.'), 1);
		if($ext) {
		    $allow = explode(',', $allowExt);

			if(is_array($allow)) {
				$check = in_array($ext, $allow);
			} else {
				$check = ($ext == $allow) ? true : false;
			}
		}
	
		if(!$ext || !$check) exit('<script type="text/javascript">alert(\''.$ext.' 파일은 업로드 하실수 없습니다!\'); history.go(-1);</script>');
		$upload_file = $folder.$file_name.'.'.strtolower($ext);
		if(@move_uploaded_file($file['tmp_name'], $upload_file)) {
			@chmod($upload_file, 0707);
				//$return = '<script type="text/javascript">function copy(str) { clipboardData.setData("Text", str); alert("경로가 복사 되였습니다."); }</script>';
				//$return.= '업로드 된 파일 경로 : <a href="#" onclick="copy(\''.$upload_file.'\'); return false;">'.$upload_file.'</a>';
				//return $return;
		} else {
			exit('<script type="text/javascript">alert(\'업로드에 실패하였습니다!\'); history.go(-1);</script>');
		}
		list($width, $height, $image_type) = getimagesize($upload_file);
		if($width+$height>500)
			exit('<script type="text/javascript">alert(\'가로 세로 합이 500미만인 이미지를 올려주세요.\'); history.go(-1);</script>');
		return $upload_file;
	}

	$img=file_upload($_FILES['file'], 'assets/', 'gif,jpg,png', time());
	$img=basename($img);
}
?>
<!DOCTYPE html>
<html>
<head>

    <title>WebGL 3D Model Viewer Using three.js</title>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="three.js"></script>
    <script src="Detector.js"></script>
    <script src="OrbitControls.js"></script>
    <script src="OBJLoader.js"></script>
    <script src="MTLLoader.js"></script>

    <style>
        body {
            overflow: hidden;
            margin: 0;
            padding: 0;
            background: hsl(0, 0%, 10%);
			font-size:.70em;
        }

        p {
            margin: 0;
            padding: 0;
        }

        .left,
        .right {
            position: absolute;
            color: #fff;
            font-family: Geneva, sans-serif;
        }

        .left {
            bottom: 1em;
            left: 1em;
            text-align: left;
        }

        .right {
            bottom: 1em;
            right: 1em;
            text-align: right;
        }

        a {
            color: #ccc;
        }
    </style>

</head>
<body id="domodomobody">

    <div class="left">
		<p id="log"><?php echo $title;?><p>
        <p><?php echo $subtitle;?><p>
		<p>by <?php echo $pixeler;?><p>
        <p><a href="http://www.kimchulho.com/" target="_top">kimchulho.com</a></p>
    </div>
<!--
    <a class="right" href="https://github.com/Lorti/webgl-3d-model-viewer-using-three.js" target="_top">
        <img src="https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67">
    </a>
-->
	<div class="right">
		<img src="http://www.kimchulho.com/work/domodomo/domodomologo_white.svg" height="25px" style="opacity:0.5;" onclick="parent.toggleFullScreen()">
	</div>

    <script>

        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
        }

        var container;
		var domodomoobj;
        var camera,camera2, controls, scene, renderer;
        var lighting, ambient, keyLight, fillLight, backLight;

        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
		var isMouseMove=false;
		var isFullScreen=false;
var strDownloadMime = "image/octet-stream";
        init();
        animate();

        function init() {
        var saveLink = document.createElement('div');
        saveLink.style.position = 'absolute';
        saveLink.style.top = '10px';
        saveLink.style.width = '100%';
        saveLink.style.background = '#FFFFFF';
        saveLink.style.textAlign = 'center';
        saveLink.innerHTML =
            '<a href="#" id="saveLink">Save Frame</a>';
        document.body.appendChild(saveLink);
        document.getElementById("saveLink").addEventListener('click', saveAsImage);

            container = document.createElement('div');
			container.id="domodomo3ddiv";
            document.body.appendChild(container);
			//document.getElementById("domodomo3ddiv").appendChild(container);

            /* Camera */

            //camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000);
            camera = new THREE.OrthographicCamera(window.innerWidth / (-2), window.innerWidth/2, window.innerHeight/2, window.innerHeight/(-2), 1, 1000);
			camera.position.x = 10;//40
			camera.position.y = 0;//20
            camera.position.z = 20;//200
			camera.zoom = 12
			camera.updateProjectionMatrix();

            /* Scene */

            scene = new THREE.Scene();

			scene.position.y=-11;
            lighting = false;

            ambient = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambient);

            keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 10%, 15%)'), .05);
            keyLight.position.set(-100, 0, 100);

            fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), .05);
            fillLight.position.set(100, 0, 100);

            backLight = new THREE.DirectionalLight(0xffffff, .05);
            backLight.position.set(100, 0, -100).normalize();
			//scene.add(keyLight);
			//scene.add(fillLight);
			//scene.add(backLight);

            /* Model */

            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setBaseUrl('assets/');
            mtlLoader.setPath('assets/');
			mtlLoader.load('texture.php?texture=<?php echo $img;?>', function (materials) {
            //mtlLoader.load('ti.mtl', function (materials) {

                materials.preload();

                materials.materials.default.map.magFilter = THREE.NearestFilter;
                materials.materials.default.map.minFilter = THREE.LinearFilter;
				materials.materials.default.side = THREE.FrontSide;
				//materials.materials.default.transparent = true;
				materials.materials.default.alphaTest = .5;

                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath('assets/');
                objLoader.load('ti.obj', function (object) {
					domodomoobj=object;
                    scene.add(object);

                });

            });

            var mtlLoader2 = new THREE.MTLLoader();
            mtlLoader2.setBaseUrl('assets/');
            mtlLoader2.setPath('assets/');
			mtlLoader2.load('texture.php?texture=<?php echo $img;?>&back=true', function (materials) {
            //mtlLoader.load('ti.mtl', function (materials) {

                materials.preload();

                materials.materials.default.map.magFilter = THREE.NearestFilter;
                materials.materials.default.map.minFilter = THREE.LinearFilter;
				materials.materials.default.side = THREE.BackSide;
				//materials.materials.default.transparent = true;
				materials.materials.default.alphaTest = .5;

                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath('assets/');
                objLoader.load('ti.obj', function (object) {
					domodomoobj=object;
                    scene.add(object);

                });

            });


            /* Renderer */

            renderer = new THREE.WebGLRenderer({
                    preserveDrawingBuffer: true
                });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(new THREE.Color("hsl(0, 0%, 20%)"));

            container.appendChild(renderer.domElement);

            /* Controls */

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;
			controls.autoRotate = false;
			controls.autoRotateSpeed = 3;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;
            /* Events */

            window.addEventListener('resize', onWindowResize, false);
            window.addEventListener('keydown', onKeyboardEvent, false);
			document.getElementById("domodomo3ddiv").addEventListener('mouseup', onMouseUp, false);
			document.getElementById("domodomo3ddiv").addEventListener('mousedown', onMouseDown, false);
			document.getElementById("domodomo3ddiv").addEventListener('mousemove', onMouseMove, false);

        }

        function onWindowResize() {

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }

		
		function onMouseUp(e){
			//document.getElementById("log").innerHTML="onMouseUp";
			if(isMouseMove)
				controls.autoRotate=false;
		}

		function onMouseDown(e){
			//document.getElementById("log").innerHTML="onMouseDown";
			if(isMouseMove)
				controls.autoRotate=false;
			else
			{
				//isFullScreen
				controls.autoRotate=!controls.autoRotate;
				isMouseMove = false;
			}
		}

		function onMouseMove(e){
			//isMouseMove = false;
			//document.getElementById("log").innerHTML="isMouseMove:"+isMouseMove+" / "+camera2+" "+camera.position.x;
			if(!controls.autoRotate)
			{
				//document.getElementById("log").innerHTML="onMouseMoveno"+" / "+camera2+" "+camera.position.x;
				isMouseMove = false;
			}
			else
			{
				isMouseMove = true;
				//document.getElementById("log").innerHTML="onMouseMove"+" / "+camera2+" "+camera.position.x;
			}
			
		}

        function onKeyboardEvent(e) {

            if (e.code === 'KeyL') {

                lighting = !lighting;

                if (lighting) {

                    ambient.intensity = 0.25;
                    scene.add(keyLight);
                    scene.add(fillLight);
                    scene.add(backLight);

                } else {

                    ambient.intensity = 1.0;
                    scene.remove(keyLight);
                    scene.remove(fillLight);
                    scene.remove(backLight);

                }

            }

        }

        function animate() {
			
			//domodomoobj.rotation.x += 0.005;
			//domodomoobj.rotation.z += 0.01;
			renderer.render( scene, camera );

            requestAnimationFrame(animate);

            controls.update();

            render();

        }

        function render() {

            renderer.render(scene, camera);

        }

   function saveAsImage() {
        var imgData, imgNode;

        try {
            var strMime = "image/png";
            imgData = renderer.domElement.toDataURL(strMime);

            saveFile(imgData.replace(strMime, strDownloadMime), "test.png");

        } catch (e) {
            console.log(e);
            return;
        }

    }

    var saveFile = function (strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
    }
    </script>
<script>
  var videoElement = document.getElementById("domodomobody");
    
  function toggleFullScreen() {
	//controls.autoRotate=!controls.autoRotate;
    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
      } else {
        videoElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }
  }
  /*
  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
      toggleFullScreen();
    }
  }, false);*/
</script>
<
</body>
</html>
