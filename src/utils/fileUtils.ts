import { Actor, Group, Relation } from '../types';
import * as XLSX from 'xlsx';

interface MapData {
  actors: Actor[];
  groups: Group[];
  relations: Relation[];
}

export function exportToJson(data: MapData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJson(jsonString: string): MapData {
  try {
    const data = JSON.parse(jsonString);
    if (!data.actors || !data.groups || !data.relations) {
      throw new Error('Invalid JSON format');
    }
    return data;
  } catch (error) {
    throw new Error('Failed to parse JSON file');
  }
}

export function exportToExcel(data: MapData): Uint8Array {
  const workbook = XLSX.utils.book_new();

  // Actors worksheet
  const actorsWs = XLSX.utils.json_to_sheet(data.actors.map(actor => ({
    ...actor,
    position: `${actor.position.x},${actor.position.y}`,
    groups: actor.groups.join(',')
  })));
  XLSX.utils.book_append_sheet(workbook, actorsWs, 'Actors');

  // Groups worksheet
  const groupsWs = XLSX.utils.json_to_sheet(data.groups);
  XLSX.utils.book_append_sheet(workbook, groupsWs, 'Groups');

  // Relations worksheet
  const relationsWs = XLSX.utils.json_to_sheet(data.relations);
  XLSX.utils.book_append_sheet(workbook, relationsWs, 'Relations');

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

export function importFromExcel(buffer: ArrayBuffer): MapData {
  const workbook = XLSX.read(buffer);

  // Read actors
  const actorsWs = workbook.Sheets['Actors'];
  const actors = XLSX.utils.sheet_to_json(actorsWs).map(row => ({
    ...row,
    position: parsePosition(row['position']),
    groups: row['groups'] ? String(row['groups']).split(',') : []
  })) as Actor[];

  // Read groups
  const groupsWs = workbook.Sheets['Groups'];
  const groups = XLSX.utils.sheet_to_json(groupsWs) as Group[];

  // Read relations
  const relationsWs = workbook.Sheets['Relations'];
  const relations = XLSX.utils.sheet_to_json(relationsWs) as Relation[];

  return { actors, groups, relations };
}

function parsePosition(posStr: string): { x: number; y: number } {
  const [x, y] = posStr.split(',').map(Number);
  return { x, y };
}