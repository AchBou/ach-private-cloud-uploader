<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let to ='';
    export let text;
</script>

<div class="btn-container" on:click>
    {#if to}
        <a href="/{to}" >
            <div >
                {text}
            </div>
        </a>
    {:else}
        <div>
            {text}
        </div>
    {/if}
</div>


<style>
    .btn-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 150px;
        height: 35px;
        padding: 20px ;
        margin: 10px;
        background-color: #999999;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
        font-size: 30px;
        color: white;
    }
    a{
        text-decoration: none;
    }
</style>