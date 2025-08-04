<script>
    import Button from "../components/Button.svelte";
</script>

<div class="hero">
    <div class="hero-content">
        <h2>Welcome to The Horny Grail</h2>
        <p>Your ultimate destination for exploring amazing images</p>

        <div class="buttons">
            <div class="btn">
                <Button to="browse" text="Browse" size="large"/>
            </div>
            <div class="btn">
                <Button to="random" text="Random" size="large"/>
            </div>
        </div>
    </div>
</div>


<style>
    .hero {
        background-color: #2c3e50;
        color: white;
        padding: 60px 20px;
        text-align: center;
        border-radius: 8px;
        margin-bottom: 40px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .hero-content h2 {
        font-size: 3em;
        margin-bottom: 20px;
        color: #e74c3c;
        font-weight: 800;
        letter-spacing: 1px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .hero-content p {
        font-size: 1.3em;
        margin-bottom: 30px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
        font-weight: 300;
        line-height: 1.5;
        letter-spacing: 0.3px;
    }

    .buttons {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 30px;
    }

    .btn {
        margin: 10px;
        transition: transform 0.3s;
    }

    .btn:hover {
        transform: translateY(-5px);
    }

</style>
