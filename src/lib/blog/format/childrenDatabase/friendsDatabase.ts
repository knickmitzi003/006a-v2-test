import { Friend } from '@/src/types/blog'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export const formatFriendsDatabase = (
  friendsDatabase: PageObjectResponse[]
): Friend[] => {
  const friends: Friend[] = friendsDatabase.map((friend) => {
    const { properties } = friend
    const { name, url, avatar } = properties

    const nameText = name.type === 'title' && name.title[0]?.plain_text
    const link = url.type === 'url' && url.url
    let image = ''
    if (avatar.type === 'files' && avatar.files[0]) {
      const file = avatar.files[0]
      if (file.type === 'external') image = file.external?.url || ''
      else if (file.type === 'file') image = file.file?.url || ''
    }

    return {
      name: nameText ? nameText : '',
      link: link ? link : '',
      avatar: image,
    }
  })

  return friends
}
