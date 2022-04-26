<script>
    export let src;
</script>

<div >
    <img {src} alt="image">
</div>

<style>
    div {
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        padding: 5px;
        margin: 5px;
        border: 1px solid rgba(0, 0, 0, 0.8);

    }

    img {
        margin: auto;
    }
</style>