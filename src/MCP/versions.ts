import * as fs from 'fs';
import * as path from 'path';

const versiondir = path.join(__dirname, 'profileVersions')

interface update {
    version: string,
    items: any[],
    stats: Object
}

interface version {
    profileId: string;
    data: update;
}

const avalibleVersions : version[] = fs.readdirSync(versiondir)
    .filter(x => x.endsWith('.json'))
    .map(
        (filename) => {
            const filePath = path.join(versiondir, filename);
            return {
                profileId: filename.split('.').shift(),
                data: JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            }
        }
    );

export default avalibleVersions;