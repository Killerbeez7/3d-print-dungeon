import { useParams } from "react-router-dom";

const mockModels = [
    {
        id: 1,
        title: "Cyber Samurai",
        artist: "Jane Doe",
        category: "3D",
        imageUrl: "https://source.unsplash.com/random/800x600?cyber",
        likes: 234,
        views: 3214,
        description: "A futuristic cyber samurai model with intricate details.",
        artistProfile: {
            name: "Jane Doe",
            avatar: "https://source.unsplash.com/100x100?woman",
            bio: "3D artist specializing in cyberpunk-themed models.",
        },
    },
    // Add more models as needed
];

export const ModelDetails = () => {
    const { id } = useParams();
    const model = mockModels.find((m) => m.id === parseInt(id));

    if (!model) {
        return <div className="text-center text-txt-primary mt-20">Model not found.</div>;
    }

    return (
        <div className="bg-bg-primary text-txt-primary min-[calc(100vh-4em)] p-6 flex flex-col lg:flex-row">
            {/* Model Display Section */}
            <div className="flex-1 lg:h-[calc(100vh-10rem)] overflow-auto">
                <img src="../../../public/cyber_samurai.jpg" alt={model.title} className="w-full h-auto rounded-md shadow-lg" />
            </div>

            {/* Artist & Model Info Section */}
            <aside className="w-full lg:w-1/5 mt-6 lg:mt-0 lg:ml-8 bg-bg-surface py-4 px-8 rounded-md shadow-md lg:h-[calc(100vh-10rem)] lg:overflow-y-auto">
                {/* Artist Info */}
                <div className="flex items-center pb-4 border-b border-br-primary">
                    <img src={model.artistProfile.avatar} alt={model.artistProfile.name} className="w-16 h-16 rounded-full" />
                    <div className="ml-3">
                        <h2 className="text-lg font-semibold">{model.artistProfile.name}</h2>
                        <p className="text-txt-secondary text-sm">{model.artistProfile.bio}</p>
                    </div>
                </div>

                {/* Model Info */}
                <div className="mt-4">
                    <h1 className="text-2xl font-bold">{model.title}</h1>
                    <div className="mt-2 flex items-center space-x-4 text-txt-secondary">
                        <span>
                            <i className="fas fa-heart text-error"></i> {model.likes}
                        </span>
                        <span>
                            <i className="fas fa-eye text-txt-highlight"></i> {model.views}
                        </span>
                    </div>
                    <p className="text-txt-secondary">Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi veritatis tempore voluptate quos fugiat, exercitationem eligendi quia optio veniam, quis est? Ratione non ab ut. Unde, maiores? Sed iste, atque veniam soluta explicabo dolorem quos quidem dolorum accusamus praesentium temporibus quam iusto accusantium doloribus earum tempore est, voluptas illo nobis voluptate. Eaque, suscipit iure repellendus tenetur, facere quibusdam soluta corporis ratione officiis velit cumque at. Quasi placeat ea corporis commodi quo inventore mollitia harum aut eligendi ducimus pariatur facilis, qui cumque consequuntur maxime dicta odit esse eveniet possimus provident soluta nesciunt recusandae velit. Odit sint doloremque aspernatur nihil itaque labore aliquam ipsum? Veniam molestiae quam maxime ullam mollitia reprehenderit obcaecati nemo dolorem laboriosam temporibus quo hic totam, et eius earum id rem nostrum, dicta corporis. Doloribus modi rerum porro in. Soluta, blanditiis placeat non quae dicta et ipsa nulla similique nihil at ullam, laudantium ab pariatur! Eveniet consequatur placeat voluptatum temporibus quos culpa quis ex. Explicabo dolor excepturi unde minima non cumque fuga, repellendus commodi, id, ratione sint optio. Tempora eaque rem aliquid quas dicta accusantium, corrupti eos facere corporis dignissimos ratione iure quo architecto quaerat dolore sapiente id amet, minus voluptas rerum, culpa nesciunt ex. Incidunt odio ea accusamus?{model.description}</p>
                </div>
            </aside>
        </div>
    );
};
