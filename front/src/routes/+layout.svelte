<script>
</script>

<header>
    <div class="logo">
        <a href="/" class="title-link">
            <h1>THE HORNY GRAIL</h1>
        </a>
    </div>
</header>

<div class="main">
    <slot></slot>
</div>

<footer>
    <p>© 2023 The Horny Grail - All rights reserved</p>
</footer>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Poppins', sans-serif;
        background-color: #f5f5f5;
        color: #333;
        line-height: 1.6;
        font-size: 16px;
        font-weight: 400;
    }

    :global(h1, h2, h3, h4, h5, h6) {
        font-family: 'Montserrat', sans-serif;
        line-height: 1.2;
        margin-top: 0;
        font-weight: 700;
    }

    header {
        background-color: #2c3e50;
        color: white;
        padding: 1em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .logo {
        flex: 1;
    }

    h1 {
        color: #e74c3c;
        text-transform: uppercase;
        font-size: 2.2em;
        font-weight: 800;
        margin: 0;
        letter-spacing: 3px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        transition: color 0.3s ease;
    }

    .title-link {
        text-decoration: none;
        cursor: pointer;
    }

    .title-link:hover h1 {
        color: #ff6b6b;
    }


    .main {
        min-height: calc(100vh - 160px);
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
        background-color: #f5f5f5;
    }

    footer {
        background-color: #2c3e50;
        color: white;
        text-align: center;
        padding: 20px;
        font-size: 0.9em;
        font-weight: 300;
        letter-spacing: 0.5px;
    }

    footer p {
        margin: 0;
        opacity: 0.9;
    }
</style>
