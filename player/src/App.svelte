<script>
	export let name;
	import Thumbnail from './Thumbnail.svelte';
	let thumbnails = [];
	fetch("https://50d1753uoh.execute-api.us-east-1.amazonaws.com/thumbnails")
		.then(res=>res.json())
		.then(json=>{
			console.log(json)
			thumbnails = json;
		})
</script>

<header>
	<h1>THE HORNY GRAIL</h1>
</header>
<main>
	{#each thumbnails as thumbnail}

			<Thumbnail src={"https://dqvs0hmo3wpp7.cloudfront.net/"+thumbnail}/>

	{/each}
</main>

<style>
	header {
		text-align: center;
		padding: 1em;
		max-width: 30%;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

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