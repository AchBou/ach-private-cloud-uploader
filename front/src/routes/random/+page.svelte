<script>
    import Button from "../../components/Button.svelte";
    import {onMount} from "svelte";

    let randomSrc = "";

    async function generateRandomPic() {
        try {
            let response = await fetch("https://50d1753uoh.execute-api.us-east-1.amazonaws.com/get-random-image");
            randomSrc = await response.text();
            console.log(randomSrc);
        } catch (err) {
            console.error(err);
        }
    }

    onMount(generateRandomPic);

</script>

<div class="img-container">
    {#if randomSrc}
        <img class="random-image" src={randomSrc} alt="random image" />
    {/if}
</div>

<div class="generate-btn">
    <Button  on:click={generateRandomPic} text="Another"/>
</div>

<style>
    .img-container {
        background-color: #fff;
        text-align: center;
        display: flex;
        align-items: center;
        width: 80%;
        height: 78vh;
        margin: 0 auto;
    }
    .random-image {
        display: block; /* Remove default inline-block spacing */
        margin: 0 auto; /* Center the image horizontally */
        max-height: 78vh;
    }
    .generate-btn {
        position: fixed;
        bottom: 50px;
        left: 46%;
    }
</style>