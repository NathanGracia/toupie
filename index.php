<!doctype html>
<html class="no-js" lang="zxx">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>BeySimulateur</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">

    <!-- CSS here -->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/animate.min.css">
    <link rel="stylesheet" href="assets/css/themify-icons.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
<!-- Preloader Start -->
<div id="preloader-active">
    <div class="preloader d-flex align-items-center justify-content-center" style="background-color: #020230">
        <div class="preloader-inner position-relative">
            <div class="preloader-circle"></div>
            <div class="preloader-img pere-text">
                <img src="assets/img/loader.png" alt="">
            </div>
        </div>
    </div>
</div>

<main>

    <!-- Slider Area Start-->
    <div class="slider-area slider-bg">
        <div class="slider-active dot-style">
            <div class="single-slider d-flex align-items-center slider-height"  style="min-height: 835px;">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6 col-md-9 ">
                            <div class="hero__caption">
                                <h1 data-animation="fadeInLeft" data-delay=".3s">BeySimulateur (à revoir le nom la)</h1>
                                <p data-animation="fadeInLeft" data-delay=".6s">Le meilleur site de simulateurs de combats de toupies</p>
                                <!-- Slider btn -->
                                <div class="slider-btns">
                                    <!-- Hero-btn -->
                                    <a data-animation="fadeInLeft" data-delay="1s" href="./play.php" class="btn radius-btn" style="margin-bottom: 10px;">Type Aléatoire</a>
                                    <a data-animation="fadeInLeft" data-delay="1s" href="./play.php?category=attack" class="btn btn-attack" style="background: blue; margin-bottom: 10px;">Type Attaque</a>
                                    <a data-animation="fadeInLeft" data-delay="1s" href="./play.php?category=stamina" class="btn btn-stamina" style="background: orange">Type Endurance</a>
                                    <a data-animation="fadeInLeft" data-delay="1s" href="./play.php?category=defense" class="btn btn-defense" style="background: green">Type Défense</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="hero__img d-none d-lg-block f-right">
                                <img src="assets/img/image.png" style="width:400px; height:auto" alt="" data-animation="fadeInRight" data-delay="1s">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<footer>
    <!-- Footer Start-->
    <div class="footer-area">
        <div class="container">
            <div class="footer-bottom" style="border-top: 0px">
                <div class="row d-flex justify-content-between align-items-center">
                    <div class="col-xl-9 col-lg-9 ">
                        <div class="footer-copy-right">
                            <p><!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
                                Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i class="fa fa-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a>
                                <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. --></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Footer End-->
</footer>



<!-- Jquery, Bootstrap -->
<script src="./assets/js/vendor/jquery-1.12.4.min.js"></script>
<script src="./assets/js/bootstrap.min.js"></script>
<!-- Jquery Slick -->
<script src="./assets/js/slick.min.js"></script>
<!-- Main Jquery -->
<script src="./assets/js/main.js"></script>

</body>
</html>