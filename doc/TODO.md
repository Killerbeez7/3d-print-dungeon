# models optimization

## 1. Optimize converter, modelView, uploadModel, Gallery components

```sh
    1.uploadModel - add low low res render for placeholder

    2.Gallery/modelView - add low res placeholder then load the actual render,
         add lazy loading, add img dimensions for better SEO and web app structure

    EXAMPLE: <img lowsrc=lo-res.jpg src=hi-res.jpg alt>

    3.converter - change the scene options for better view and faster loading
```

## 2. Choose style for comments/rating section

```sh
    1. comments/rating - Add better UI/UX
    2. choose how they should work      #DONE
    EXAMPLE: sumbit rating only, rating and comment, only comment...
    3. 
```

3.
4.
5.
6.
7.
8.
9.
10.

### search engine
```sh
1. rename search with links to GlobalSearch and DynamicSearch  #DONE

2. if GlobalSearch have input in it and the user change the path #DONE
Example: click on gallery the search should reset, if clicked on link inside the search input should be passed 

3. make the criteria work
```