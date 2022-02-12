<?php $texture=(!isset($_GET['texture'])||$_GET['texture']=='')? 'harumi.png' : $_GET['texture'];
echo "newmtl default\n";
echo "Ks 0.00000 0.00000 0.00000\n";
echo $_GET['back']=='true'?"Kd 0.5 0.5 0.5\n":"Kd 1 1 1\n";
echo "map_Kd ".$texture;
?>