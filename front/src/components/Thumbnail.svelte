<script>
    export let src;

    function handleError(event) {
        event.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
    }
</script>

<div class="thumbnail">
    <div class="image-container">
        <img {src} alt="thumbnail" on:error={handleError}>
    </div>
</div>

<style>
    .thumbnail {
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, box-shadow 0.3s;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .image-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        overflow: hidden;
        position: relative;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        transition: transform 0.3s;
    }

    .thumbnail:hover img {
        transform: scale(1.05);
    }
</style>
