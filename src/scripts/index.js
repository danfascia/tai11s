import list from './modules/list'

if (recipes != undefined && tags != undefined) {
  document.getElementById('SearchInput').addEventListener('keyup', (ev)=> {
    const searchString = document.getElementById('SearchInput').value.toLowerCase();
    // clear out the div
    document.getElementById('RecipeList').innerHTML = ``;
    // create new content
    tags.forEach((tag) => {
      const outerDiv = document.createElement('div');
      outerDiv.classList.add('my-4')
      const header = document.createElement('h3');
      header.innerHTML = tag.label;
      header.classList.add("mb-1");
      const list = document.createElement('ul');
      list.classList.add('list', 'mb-8', 'px-8');
      let listElements = ``;
      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        let includesTag = false;
        recipe.tags.forEach(t => {
          if (t.toLowerCase() === tag.id) includesTag = true;
        })
        if (recipe.name.toLowerCase().includes(searchString) && includesTag) {
          listElements += '<li><a href="/recipes/' + recipe.slug + '/">' + recipe.name + '</a></li>';
        }
      }
      list.innerHTML = listElements;
      outerDiv.append(header)
      outerDiv.append(list)
      document.getElementById('RecipeList').append(outerDiv);
      if (listElements == ``) outerDiv.classList.add('hidden');
    });

    const outerDiv = document.createElement('div');
    outerDiv.classList.add('my-4')
    const header = document.createElement('h3');
    header.innerHTML = `Untagged`;
    header.className = "mb-1";
    const list = document.createElement('ul');
    list.className = "list mb-8 px-8";
    let listElements = ``;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      if (recipe.name.toLowerCase().includes(searchString) && !recipe.tags.length) {
        listElements += '<li><a href="/recipes/' + recipe.slug + '/">' + recipe.name + '</a></li>';
      }
    }
    list.innerHTML = listElements;
    outerDiv.append(header)
    outerDiv.append(list)
    document.getElementById('RecipeList').append(outerDiv);
    if (listElements == ``) outerDiv.classList.add('hidden');
  })
}