import { useState, useEffect } from 'react';
import EntityCard from "@/client-graphql/edit-entity/entity-card.tsx"
import EditDrawer from "@/client-graphql/edit-entity/edit-drawer.tsx"

export function NodeList({ initContents, parentType }) {
  const [contents, setContents] = useState(initContents);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [drawerKey, setDrawerKey] = useState(0);

  useEffect(() => {
    setContents(initContents);
  }, [initContents]);

  const handleOpen = (content) => {
    setSelectedContent(content);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerKey(prev => prev + 1);
  };

  return (
    <>
      <ol className="-mr-3">
        {contents.map((content) => (
          <li key={content.id} onClick={() => handleOpen(content)}>
            <EntityCard
              name={content.properties.name}
              avatarUrl="https://cdn.midjourney.com/484b9f2d-6652-4af4-a82a-706244b76e1f/0_3.jpeg"
              fallbackText="CN"
            />
          </li>
        ))}
      </ol>

      {selectedContent && (
        <EditDrawer
          key={drawerKey}
          label={`${parentType} -> ${selectedContent.properties.name}`}
          open={drawerOpen}
          setOpen={setDrawerOpen}
          onForceClose={closeDrawer}
        >
          <ul className="space-y-2">
            {selectedContent.properties.contents?.map((child) => (
              <EntityCard
                key={child.id}
                name={child.properties.name}
                avatarUrl="https://cdn.midjourney.com/484b9f2d-6652-4af4-a82a-706244b76e1f/0_3.jpeg"
                fallbackText="CN"
              />
            ))}
          </ul>
        </EditDrawer>
      )}
    </>
  );
}
