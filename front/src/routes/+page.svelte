<script>
import Button from "../components/Button.svelte";
</script>

<div class="center buttons">
    <div class="btn">
        <Button to="random" text="Random"/>
    </div>
    <div class="btn">
        <Button to="browse" text="Browse"/>
    </div>
</div>

<style>
    .center{
        text-align: center;
    }

    .buttons{
        align-items: center;
    }

    .btn{
        display: inline-block;
        margin: auto 20px;
    }
</style>