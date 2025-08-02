<script>
    import Thumbnail from '../../components/Thumbnail.svelte';

    let thumbnails = [];
    fetch("https://50d1753uoh.execute-api.us-east-1.amazonaws.com/thumbnails")
        .then(res=>res.json())
        .then(json=>{
            console.log(json)
            thumbnails = json;
        })
        .catch(err => console.error(err));
</script>


<main>
    {#each thumbnails as thumbnail}
        <Thumbnail src={"https://dqvs0hmo3wpp7.cloudfront.net/"+thumbnail}/>
    {/each}
</main>

<style>

    main{
        display: grid;
        grid-template-columns: repeat(4, 1fr);;
        grid-auto-rows: 1fr;
        /*background-color: #2196F3;*/
    }

    /*.grid-item{*/
    /*	background-color: rgba(255, 255, 255, 0.8);*/
    /*	border: 1px solid rgba(0, 0, 0, 0.8);*/
    /*	padding: 10px;*/
    /*	margin: 10px;*/
    /*	text-align: center;*/
    /*}*/
</style>